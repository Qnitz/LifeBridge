# API map

## auth

| Endpoint | Method | Auth? | Purpose | Request | Response | Implemented in (path) |
| --- | --- | --- | --- | --- | --- | --- |
| /api/login | POST | No | Issue JWT token for login | JSON: { username, password } | JSON: { access_token, token_type } | [app/api/auth.py](app/api/auth.py) |
| /api/register | POST | No | Register user and issue JWT | JSON: { username, password } | JSON: { access_token, token_type } | [app/api/auth.py](app/api/auth.py) |

## simulate

| Endpoint | Method | Auth? | Purpose | Request | Response | Implemented in (path) |
| --- | --- | --- | --- | --- | --- | --- |
| /api/simulate/walk | POST | Yes | Inject walking event | none | JSON: ingest_event result | [app/api/simulate.py](app/api/simulate.py) |
| /api/simulate/fall | POST | Yes | Inject fall event | none | JSON: ingest_event result | [app/api/simulate.py](app/api/simulate.py) |

## alerts

| Endpoint | Method | Auth? | Purpose | Request | Response | Implemented in (path) |
| --- | --- | --- | --- | --- | --- | --- |
| /api/alerts | GET | Yes | List active alerts + last resolved | query: limit | JSON: list[Alert] | [app/api/alerts.py](app/api/alerts.py) |
| /api/alerts/{alert_id}/ack | POST | Yes | Acknowledge alert | path: alert_id | JSON: { status, id } | [app/api/alerts.py](app/api/alerts.py) |
| /api/alerts/{alert_id}/resolve | POST | Yes | Resolve alert | path: alert_id | JSON: { status, id } | [app/api/alerts.py](app/api/alerts.py) |

## activity

| Endpoint | Method | Auth? | Purpose | Request | Response | Implemented in (path) |
| --- | --- | --- | --- | --- | --- | --- |
| /api/activity | GET | Yes | Recent activity events | query: limit | JSON: list[{ id, timestamp, event_type, confidence, state, raw_data }] | [app/api/activity.py](app/api/activity.py) |

## status

| Endpoint | Method | Auth? | Purpose | Request | Response | Implemented in (path) |
| --- | --- | --- | --- | --- | --- | --- |
| /api/status | GET | Yes | Latest system status | none | JSON: { state, active_alert, system_paused, confidence, last_update } | [app/api/status.py](app/api/status.py) |

## config

| Endpoint | Method | Auth? | Purpose | Request | Response | Implemented in (path) |
| --- | --- | --- | --- | --- | --- | --- |
| /api/config | GET | Yes | Read user config | none | JSON: config dict | [app/api/config.py](app/api/config.py) |
| /api/config | PUT | Yes | Update user config | JSON: { alert_confidence_threshold?, high_severity_threshold?, fall_probability?, device_id? } | JSON: config dict | [app/api/config.py](app/api/config.py) |

## logs

| Endpoint | Method | Auth? | Purpose | Request | Response | Implemented in (path) |
| --- | --- | --- | --- | --- | --- | --- |
| /api/logs/export | GET | Yes | Export recent events CSV | query: limit | text/csv (lifebridge_logs.csv) | [app/api/logs.py](app/api/logs.py) |

## events

| Endpoint | Method | Auth? | Purpose | Request | Response | Implemented in (path) |
| --- | --- | --- | --- | --- | --- | --- |
| /api/events | POST | Yes | Ingest event from device/app | JSON: { device_id, event_type, state, confidence } | JSON: { status, data } | [app/api/events.py](app/api/events.py) |
