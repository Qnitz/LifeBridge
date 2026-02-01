# UI ↔ API mapping + polling

## /status
- Page: [templates/status.html](templates/status.html)
- JS: [static/status-page.js](static/status-page.js)
- APIs: GET `/api/status` via `authFetch()`
- Polling: `setInterval(refreshStatus, 5000)`
- Render: `renderStatus()` updates badge/state/last update/confidence/paused

## /alerts
- Page: [templates/alerts.html](templates/alerts.html)
- JS: [static/alerts-page.js](static/alerts-page.js)
- APIs: GET `/api/alerts?limit=20`, POST `/api/alerts/{id}/ack`, POST `/api/alerts/{id}/resolve`
- Polling: `setInterval(refreshAlerts, 5000)`
- Render: `renderAlerts()` builds alert cards + action buttons

## /activity
- Page: [templates/activity.html](templates/activity.html)
- JS: [static/activity-page.js](static/activity-page.js)
- APIs: GET `/api/activity?limit=30`
- Polling: `setInterval(refreshActivity, 5000)`
- Render: `renderActivity()` fills table + activity strip dots

## /config
- Page: [templates/config.html](templates/config.html)
- JS: [static/config-page.js](static/config-page.js)
- APIs: GET `/api/config`, PUT `/api/config`
- Polling: none (loads once on page load)
- Render: `loadConfig()` populates form fields; `saveConfig()` posts updates

## /login
- Page: [templates/login.html](templates/login.html)
- JS: [static/login.js](static/login.js)
- APIs: POST `/api/login`, POST `/api/register`
- Polling: none
- Render: form submit handlers update status text and redirect
