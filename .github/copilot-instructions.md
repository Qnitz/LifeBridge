# Copilot instructions for LifeBridge

## Architecture at a glance
- FastAPI app is defined in [app/main.py](app/main.py). It mounts the static UI, serves [templates/index.html](templates/index.html), and registers API routers.
- SQLite persistence is via SQLAlchemy models in [app/db/models.py](app/db/models.py) with session setup in [app/db/session.py](app/db/session.py). Note the effective DB URL comes from `Settings.db_url` in [app/core/settings.py](app/core/settings.py).
- Event ingestion flow: API routes in [app/api/events.py](app/api/events.py) call `ingest_event()` in [app/services/event_router.py](app/services/event_router.py) → create `Event` rows → `should_alert()`/`create_alert()` in [app/services/alert_manager.py](app/services/alert_manager.py) → `send_sms_alert()` in [app/services/notifications.py](app/services/notifications.py).
- Simulator runs on startup in [app/main.py](app/main.py) and uses [app/services/simulator.py](app/services/simulator.py) to generate synthetic falls/walking. It pauses when any HIGH `Alert` is ACTIVE.
- Configuration is stored in the `config` table as JSON (`ConfigKV`). `get_config()` and `set_config()` in [app/services/config_service.py](app/services/config_service.py) bootstrap defaults.

## Key API surface (used by the dashboard)
- Status: `/api/status` from [app/api/status.py](app/api/status.py) (includes `system_paused` when a HIGH alert is active).
- Activity: `/api/activity` from [app/api/activity.py](app/api/activity.py) (recent `Event` rows).
- Alerts: `/api/alerts` and `/api/alerts/{id}/resolve` from [app/api/alerts.py](app/api/alerts.py).
- Config: `/api/config` GET/PUT from [app/api/config.py](app/api/config.py).
- Logs export: `/api/logs/export` from [app/api/logs.py](app/api/logs.py) (CSV download).
- The dashboard polls these endpoints from [static/app.js](static/app.js).

## Project-specific patterns and conventions
- `Alert` creation is gated: if a HIGH alert is already ACTIVE, `create_alert()` returns the existing alert instead of creating a new one.
- The simulator uses physics-based signals and a detection pipeline in [app/services/simulator.py](app/services/simulator.py) (impact/freefall thresholds).
- Timestamps returned to the frontend append a trailing `Z` for UTC in [app/api/activity.py](app/api/activity.py) and [app/api/status.py](app/api/status.py).
- Twilio SMS is optional; [app/services/notifications.py](app/services/notifications.py) falls back to console output if credentials are placeholders or `twilio` is missing.

## Developer workflows (discoverable)
- App entrypoint is the FastAPI `app` in [app/main.py](app/main.py). The dependency list in [requirements.txt](requirements.txt) includes `fastapi` and `uvicorn`.
- A simple sensor simulator that posts to `/api/events` lives in [scripts/test_sensor.py](scripts/test_sensor.py).

## Integration points
- External SMS: Twilio client in `send_sms_alert()` (config constants live in [app/services/notifications.py](app/services/notifications.py)).
- Database file defaults to a local SQLite path from `Settings.db_url` in [app/core/settings.py](app/core/settings.py).

If any section is unclear or incomplete (e.g., expected run/test commands), tell me what to adjust or add.