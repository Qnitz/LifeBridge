# Inventory

## FastAPI routers/endpoints
- [app/main.py](app/main.py): `app`, `startup()`, `simulator_loop()`, route handlers `index()`, `login_page()`, `status_page()`, `alerts_page()`, `activity_page()`, `config_page()`
- [app/api/events.py](app/api/events.py): `router`, `EventInput`, `receive_mobile_event()`
- [app/api/status.py](app/api/status.py): `router`, `get_status()`
- [app/api/activity.py](app/api/activity.py): `router`, `get_activity()`
- [app/api/alerts.py](app/api/alerts.py): `router`, `get_alerts()`, `ack_alert()`, `resolve_alert()`
- [app/api/config.py](app/api/config.py): `router`, `ConfigUpdate`, `read_config()`, `update_config()`
- [app/api/logs.py](app/api/logs.py): `router`, `export_logs()`
- [app/api/simulate.py](app/api/simulate.py): `router`, `simulate_walk()`, `simulate_fall()`
- [app/api/auth.py](app/api/auth.py): `router`, `login()`, `register()`, `get_current_user()`

## auth/JWT
- [app/api/auth.py](app/api/auth.py): `LoginRequest`, `RegisterRequest`, `_issue_token()`, `get_current_user()`, `login()`, `register()`
- [app/core/settings.py](app/core/settings.py): `Settings` (JWT config fields)

## simulator
- [app/main.py](app/main.py): `simulator_loop()`
- [app/services/simulator.py](app/services/simulator.py): `now_iso()`, `generate_walking_data()`, `generate_fall_impact()`, `detect_fall()`, `next_activity_event()`
- [app/api/simulate.py](app/api/simulate.py): `simulate_walk()`, `simulate_fall()`

## SQLAlchemy models
- [app/db/models.py](app/db/models.py): `Event`, `Alert`, `ConfigKV`, `User`
- [app/db/base.py](app/db/base.py): `Base`
- [app/db/session.py](app/db/session.py): `engine`, `SessionLocal`, `init_db()`, `get_db()`

## frontend pages + polling JS
- [templates/index.html](templates/index.html)
- [templates/login.html](templates/login.html)
- [templates/status.html](templates/status.html)
- [templates/alerts.html](templates/alerts.html)
- [templates/activity.html](templates/activity.html)
- [templates/config.html](templates/config.html)
- [static/app.js](static/app.js): `refreshAll()` (polls status/alerts/activity), `authFetch()`
- [static/status-page.js](static/status-page.js): `refreshStatus()`
- [static/alerts-page.js](static/alerts-page.js): `refreshAlerts()`
- [static/activity-page.js](static/activity-page.js): `refreshActivity()`
- [static/config-page.js](static/config-page.js): `loadConfig()`, `saveConfig()`
- [static/login.js](static/login.js)
