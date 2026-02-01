# LifeBridge

LifeBridge is a FastAPI-based fall-detection monitoring app that serves HTML pages from [templates](templates) and JSON APIs from [app/api](app/api), with background simulation in [app/main.py](app/main.py) and persistence via SQLAlchemy models in [app/db/models.py](app/db/models.py).

## Run locally
1. Create a virtual environment in the repo root (e.g., `python -m venv .venv`).
2. Install dependencies from [requirements.txt](requirements.txt).
3. Start the server with `uvicorn app.main:app --reload` from [app/main.py](app/main.py).
4. Open http://127.0.0.1:8000/login (served by [app/main.py](app/main.py)).

## Demo checklist
- Login or register at `/login` (frontend in [static/login.js](static/login.js), backend in [app/api/auth.py](app/api/auth.py)).
- Trigger a fall via `/api/simulate/fall` (implemented in [app/api/simulate.py](app/api/simulate.py)).
- Acknowledge and resolve an alert via `/api/alerts/{alert_id}/ack` and `/api/alerts/{alert_id}/resolve` (in [app/api/alerts.py](app/api/alerts.py)).
- Export logs via `/api/logs/export` (in [app/api/logs.py](app/api/logs.py)).

## Docs
- [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)
- [docs/PROJECT_BOOK_DRAFT.md](docs/PROJECT_BOOK_DRAFT.md)
- [docs/PRESENTATION.md](docs/PRESENTATION.md)
