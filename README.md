# LifeBridge

LifeBridge is a demo home monitoring system built with FastAPI, JWT auth, SQLite persistence, a background simulator, and a web UI (see [app/api](app/api), [app/api/auth.py](app/api/auth.py), [app/db/models.py](app/db/models.py), [app/main.py](app/main.py), [templates](templates), [static](static)).

## How to run
- python -m venv venv
- source venv/bin/activate  # or venv\Scripts\activate on Windows
- pip install -r requirements.txt
- uvicorn app.main:app --reload

Optional: copy .env.example to .env and adjust values.

Open: http://127.0.0.1:8000/login

## Demo checklist
- Login / Register
- Simulate fall
- Acknowledge + resolve alert
- View activity
- Export logs

## Docs index
- [docs/PROJECT_BOOK_DRAFT.md](docs/PROJECT_BOOK_DRAFT.md)
- [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)
