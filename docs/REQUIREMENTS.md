# Requirements (SRS-lite)

## 1) Scope
LifeBridge is a home monitoring demo for fall detection, targeting caregivers and family members viewing status/alerts in a browser (pages in [templates](templates) driven by [static](static)).
Today, the system serves a FastAPI UI and JSON APIs, ingests events, stores them in SQLite models, and optionally creates alerts with a background simulator loop (see [app/main.py](app/main.py), [app/services/event_router.py](app/services/event_router.py), [app/db/models.py](app/db/models.py)).

## 2) Functional Requirements (implemented)
- FR-01 User can register/login and receive JWT (`/api/register`, `/api/login` in [app/api/auth.py](app/api/auth.py)).
- FR-02 Authenticated user can view status (`/api/status` in [app/api/status.py](app/api/status.py)).
- FR-03 User can simulate walk/fall events (`/api/simulate/walk`, `/api/simulate/fall` in [app/api/simulate.py](app/api/simulate.py)).
- FR-04 System ingests events and stores them (`/api/events` in [app/api/events.py](app/api/events.py); `Event` in [app/db/models.py](app/db/models.py)).
- FR-05 System creates alerts for dangerous events (`Alert` model + ingestion path in [app/services/event_router.py](app/services/event_router.py) and [app/services/alert_manager.py](app/services/alert_manager.py)).
- FR-06 User can acknowledge/resolve alerts (`/api/alerts/{alert_id}/ack`, `/api/alerts/{alert_id}/resolve` in [app/api/alerts.py](app/api/alerts.py)).
- FR-07 User can view activity history (`/api/activity` in [app/api/activity.py](app/api/activity.py)).
- FR-08 User can view/update config (`/api/config` GET/PUT in [app/api/config.py](app/api/config.py)).
- FR-09 User can export logs as CSV (`/api/logs/export` in [app/api/logs.py](app/api/logs.py)).
- FR-10 Simulator runs in background and pauses on ACTIVE+HIGH alerts (`startup()`/`simulator_loop()` in [app/main.py](app/main.py)).

## 3) Non-Functional Requirements (observed)
- Security: JWT-protected APIs via `get_current_user()` in [app/api/auth.py](app/api/auth.py); passwords are stored in plaintext in `User.password` (no hashing present) in [app/db/models.py](app/db/models.py).
- Performance: UI polls roughly every 5s using `setInterval(..., 5000)` in [static/status-page.js](static/status-page.js) and [static/alerts-page.js](static/alerts-page.js).
- Reliability: data persists in SQLite via SQLAlchemy models in [app/db/models.py](app/db/models.py) and sessions in [app/db/session.py](app/db/session.py).
- Maintainability: routers in [app/api](app/api) and service logic in [app/services](app/services) are separated.

## 4) Constraints
- Polling-based UI (no WebSocket): `setInterval(..., 5000)` in [static/status-page.js](static/status-page.js) and [static/activity-page.js](static/activity-page.js).
- Synthetic simulator (no real sensors): generator in [app/services/simulator.py](app/services/simulator.py).
- 1:1 Event↔Alert constraint: `Alert.event_id` is unique in [app/db/models.py](app/db/models.py).

## 5) Planned / Not implemented
- `Alert.acknowledged_at` is defined but not updated by any endpoint (model in [app/db/models.py](app/db/models.py)).
