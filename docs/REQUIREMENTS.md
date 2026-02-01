# Requirements (SRS-lite)

## 1) Scope
- LifeBridge is a demo home health monitoring system with a FastAPI backend and web UI (routers in [app/api](app/api), pages in [templates](templates), JS in [static](static)).
- JWT auth protects APIs via `get_current_user()` in [app/api/auth.py](app/api/auth.py).
- Data persists in SQLite through SQLAlchemy models in [app/db/models.py](app/db/models.py).
- A background simulator generates activity using `simulator_loop()` in [app/main.py](app/main.py) and event generators in [app/services/simulator.py](app/services/simulator.py).

## 2) Functional Requirements (implemented)
- FR-01 User authentication: Users can register and login using `/api/register` and `/api/login` (implemented in [app/api/auth.py](app/api/auth.py)).
- FR-02 Secure API access: All non-auth endpoints require JWT via `get_current_user()` (in [app/api/auth.py](app/api/auth.py), wired in [app/main.py](app/main.py)).
- FR-03 Event ingestion: System ingests events via `/api/events` and simulator endpoints (in [app/api/events.py](app/api/events.py), [app/api/simulate.py](app/api/simulate.py)).
- FR-04 Automatic alert generation: Alerts are created during event ingestion when dangerous conditions occur (`Event`, `Alert` models in [app/db/models.py](app/db/models.py)).
- FR-05 Alert lifecycle management: User can acknowledge and resolve alerts (`/api/alerts/{alert_id}/ack`, `/api/alerts/{alert_id}/resolve` in [app/api/alerts.py](app/api/alerts.py)).
- FR-06 Activity history: User can view recent activity events (`/api/activity` in [app/api/activity.py](app/api/activity.py)).
- FR-07 System status monitoring: User can view system state, confidence, pause state (`/api/status` in [app/api/status.py](app/api/status.py)).
- FR-08 Configuration management: User can read/update thresholds and device ID (`/api/config` GET/PUT in [app/api/config.py](app/api/config.py)).
- FR-09 Log export: User can export recent events as CSV (`/api/logs/export` in [app/api/logs.py](app/api/logs.py)).
- FR-10 Background simulation: System runs a background simulator loop (`simulator_loop()` in [app/main.py](app/main.py)).

## 3) Non-Functional Requirements (observed)
- Security: JWT bearer authentication via `get_current_user()` ([app/api/auth.py](app/api/auth.py)).
- Persistence: SQLite via SQLAlchemy models ([app/db/models.py](app/db/models.py)).
- Responsiveness: UI polling every ~5 seconds (`setInterval(..., 5000)` in [static/status-page.js](static/status-page.js), [static/alerts-page.js](static/alerts-page.js)).
- Maintainability: routers and models separated ([app/api](app/api), [app/db/models.py](app/db/models.py)).

## 4) Constraints
- Polling-based UI (no WebSockets): `setInterval(..., 5000)` in [static/status-page.js](static/status-page.js).
- Synthetic simulator data: activity generated in [app/services/simulator.py](app/services/simulator.py).
- 1:1 Event ↔ Alert relationship: `Alert.event_id` is unique in [app/db/models.py](app/db/models.py).

## 5) Planned / Not implemented
- Real sensor ingestion beyond the existing `/api/events` demo pipeline ([app/api/events.py](app/api/events.py)).
- Push notifications beyond current alert UI actions ([app/api/alerts.py](app/api/alerts.py), [static/alerts-page.js](static/alerts-page.js)).
- WebSocket updates beyond polling in [static/status-page.js](static/status-page.js).
