# Copilot instructions for LifeBridge

## Architecture at a glance
- FastAPI app is wired in [app/main.py](app/main.py): mounts static UI, serves template pages, and registers API routers.
- Persistence is SQLite via SQLAlchemy models in [app/db/models.py](app/db/models.py) with sessions in [app/db/session.py](app/db/session.py); DB URL comes from `Settings.db_url` in [app/core/settings.py](app/core/settings.py).
- Event ingestion flow: [app/api/events.py](app/api/events.py) → `ingest_event()` in [app/services/event_router.py](app/services/event_router.py) → `Event` rows → `should_alert()`/`create_alert()` in [app/services/alert_manager.py](app/services/alert_manager.py) → `send_sms_alert()` in [app/services/notifications.py](app/services/notifications.py).
- Simulator runs on startup in [app/main.py](app/main.py) using [app/services/simulator.py](app/services/simulator.py) to generate walking/fall events; it pauses whenever any HIGH `Alert` is ACTIVE.
- Configuration is stored in a JSON `ConfigKV` row; defaults are bootstrapped by `get_config()`/`set_config()` in [app/services/config_service.py](app/services/config_service.py).

## Key API surface (dashboard + auth)
- Auth endpoints: `/api/login` and `/api/register` in [app/api/auth.py](app/api/auth.py); all other routers are protected by `get_current_user()` in [app/main.py](app/main.py).
- Dashboard fetches via `authFetch()` in [static/app.js](static/app.js) using a JWT in `localStorage`.
- Status: `/api/status` ([app/api/status.py](app/api/status.py)) includes `system_paused` when a HIGH alert is active.
- Activity: `/api/activity` ([app/api/activity.py](app/api/activity.py)) returns recent `Event` rows.
- Alerts: `/api/alerts`, `/api/alerts/{id}/ack`, `/api/alerts/{id}/resolve` in [app/api/alerts.py](app/api/alerts.py).
- Config: `/api/config` GET/PUT in [app/api/config.py](app/api/config.py).
- Logs export: `/api/logs/export` in [app/api/logs.py](app/api/logs.py) returns CSV.
- Manual simulation: `/api/simulate/walk` and `/api/simulate/fall` in [app/api/simulate.py](app/api/simulate.py).

## Project-specific patterns and conventions
- `Alert` creation is gated: if a HIGH alert is already ACTIVE, `create_alert()` returns the existing alert instead of creating a new one.
- The simulator uses physics-based detection in [app/services/simulator.py](app/services/simulator.py) (impact/freefall thresholds, SVM acceleration).
- Timestamps returned to the frontend append a trailing `Z` for UTC in [app/api/activity.py](app/api/activity.py) and [app/api/status.py](app/api/status.py).
- Twilio SMS is optional; [app/services/notifications.py](app/services/notifications.py) falls back to console output when credentials are placeholders or `twilio` is missing.

## Developer workflows (discoverable)
- App entrypoint is the FastAPI `app` in [app/main.py](app/main.py); dependencies are in [requirements.txt](requirements.txt).
- A simple sensor simulator that posts to `/api/events` lives in [scripts/test_sensor.py](scripts/test_sensor.py).

## Integration points
- External SMS: Twilio client in `send_sms_alert()` with constants in [app/services/notifications.py](app/services/notifications.py).
- Database file defaults to a local SQLite path from `Settings.db_url` in [app/core/settings.py](app/core/settings.py).

If any section is unclear or incomplete (e.g., expected run/test commands), tell me what to adjust or add.