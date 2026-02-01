# Copilot instructions for lifebridge

## Architecture overview
- FastAPI app in [app/main.py](app/main.py) serves HTML pages and mounts static assets; API routers live in [app/api](app/api).
- Core data flow: event ingestion -> DB write -> optional alert creation. `ingest_event()` in [app/services/event_router.py](app/services/event_router.py) writes `Event` then calls `should_alert()`/`create_alert()` in [app/services/alert_manager.py](app/services/alert_manager.py).
- Persistence uses SQLite via SQLAlchemy models in [app/db/models.py](app/db/models.py) and session helpers in [app/db/session.py](app/db/session.py).
- Configuration is per-user JSON stored in `ConfigKV` via `get_config()`/`set_config()` in [app/services/config_service.py](app/services/config_service.py).

## Auth and API conventions
- All API routers are protected by `get_current_user()` JWT auth except login/register; see [app/api/auth.py](app/api/auth.py) and router wiring in [app/main.py](app/main.py).
- Frontend expects `Authorization: Bearer <token>` and stores token in `localStorage`; see [static/app.js](static/app.js) and [static/login.js](static/login.js).
- Timestamps are returned with a trailing `Z` for UTC in activity/status responses; see [app/api/activity.py](app/api/activity.py) and [app/api/status.py](app/api/status.py).

## Simulator and alert gating
- Startup launches `simulator_loop()` in [app/main.py](app/main.py), which pauses whenever there is an ACTIVE/HIGH alert and resumes when cleared.
- Simulation endpoints in [app/api/simulate.py](app/api/simulate.py) and physics generator in [app/services/simulator.py](app/services/simulator.py) both call `ingest_event()` for consistent alert logic.

## External integrations
- SMS is sent via Twilio; when placeholders are present, it prints simulated output. See [app/services/notifications.py](app/services/notifications.py).

## Developer workflows (discoverable)
- Dependencies are in [requirements.txt](requirements.txt); run the server with `uvicorn app.main:app --reload` from the repo root.
- Manual event source: run [scripts/test_sensor.py](scripts/test_sensor.py) to POST events to `/api/events` (requires the server to be running).

## UI expectations
- Pages are static HTML in [templates](templates) and JS-driven views under [static](static); alerts/status/activity auto-refresh every 5s.
- Alert lifecycle: `/api/alerts/{id}/ack` then `/api/alerts/{id}/resolve` (see [app/api/alerts.py](app/api/alerts.py) and [static/alerts-page.js](static/alerts-page.js)).
