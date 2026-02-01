# Presentation

## Slide 1 — Architecture
- FastAPI app serves HTML pages + JSON APIs.
- Routers in [app/api](app/api); auth enforced via JWT dependency.
- Services handle ingestion, alerting, simulator, config.
- SQLite persistence via SQLAlchemy models in [app/db](app/db).

## Slide 2 — Data Model
- Event 1:1 Alert (unique `event_id`).
- ConfigKV stores per-user JSON config.
- User holds login credentials.

```mermaid
erDiagram
  EVENT {
    int id PK
    string user_id
    string device_id
    string event_type
    string state
    float confidence
    datetime created_at
    json raw_data
  }
  ALERT {
    int id PK
    int event_id FK
    string user_id
    string severity
    string status
    datetime created_at
    datetime acked_at
    datetime acknowledged_at
  }
  CONFIGKV {
    string key PK
    string user_id PK
    string value_json
    datetime updated_at
  }
  USER {
    int id PK
    string username
    string password
    datetime created_at
  }

  EVENT ||--|| ALERT : "event_id (unique)"
```

## Slide 3 — Workflow
- Startup schedules simulator loop.
- Loop pauses on any ACTIVE + HIGH alert.
- Otherwise generates event and ingests (Event write + optional Alert).

```mermaid
flowchart TD
  A[startup()] --> B[init_db()]
  B --> C[asyncio.create_task(simulator_loop())]
  C --> D{ACTIVE + HIGH alert?}
  D -- Yes --> E[sleep + continue]
  D -- No --> F[get_config()]
  F --> G[next_activity_event()]
  G --> H[ingest_event()]
  H --> D
```

## Slide 4 — Demo Script
- Open /login → register or login.
- Redirect to / → observe status/alerts/activity panels.
- Click Alerts page → acknowledge/resolve an alert.
- Click Activity page → verify live updates.
- Click Config page → adjust thresholds and save.
- Use simulate buttons on home (walk/fall) to trigger updates.

```mermaid
sequenceDiagram
  participant UI
  participant SimAPI
  participant Ingest
  participant DB

  UI->>SimAPI: POST /api/simulate/walk or /api/simulate/fall
  SimAPI->>Ingest: ingest_event(event_type/state/confidence)
  Ingest->>DB: insert Event
  Ingest->>DB: maybe insert Alert
  UI->>SimAPI: GET /api/status, /api/alerts, /api/activity
  SimAPI-->>UI: refreshed data
```
