const statusBadge = document.getElementById("statusBadge");
const systemState = document.getElementById("systemState");
const lastUpdate = document.getElementById("lastUpdate");
const confidence = document.getElementById("confidence");
const paused = document.getElementById("paused");
const alertsList = document.getElementById("alertsList");
const activityTable = document.getElementById("activityTable");
const refreshBtn = document.getElementById("refreshBtn");
const configForm = document.getElementById("configForm");
const configStatus = document.getElementById("configStatus");

const alertThreshold = document.getElementById("alertThreshold");
const highSeverity = document.getElementById("highSeverity");
const fallProbability = document.getElementById("fallProbability");
const deviceId = document.getElementById("deviceId");

const STATE_CLASSES = {
  NORMAL: "success",
  WARNING: "warning",
  FALL_DETECTED: "danger",
};

const toLocalTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
};

const renderStatus = (data) => {
  const state = data?.state ?? "UNKNOWN";
  statusBadge.textContent = state;
  statusBadge.className = `badge ${STATE_CLASSES[state] ?? ""}`.trim();
  systemState.textContent = state;
  lastUpdate.textContent = toLocalTime(data?.last_update);
  confidence.textContent = data?.confidence != null ? data.confidence.toFixed(2) : "—";
  paused.textContent = data?.system_paused ? "Yes" : "No";
};

const renderAlerts = (alerts) => {
  if (!alerts?.length) {
    alertsList.innerHTML = "<span class='muted'>No alerts</span>";
    return;
  }

  alertsList.innerHTML = "";
  alerts.forEach((alert) => {
    const wrapper = document.createElement("div");
    wrapper.className = "alert-item";

    const header = document.createElement("div");
    header.className = "alert-header";
    header.innerHTML = `<span>${alert.severity ?? ""} ${alert.alert_type ?? "Alert"}</span><span>${alert.status ?? ""}</span>`;

    const meta = document.createElement("div");
    meta.className = "alert-meta";
    meta.innerHTML = `<span>${alert.device_id ?? ""}</span><span>${toLocalTime(alert.created_at)}</span>`;

    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = "Resolve";
    btn.addEventListener("click", async () => {
      await fetch(`/api/alerts/${alert.id}/resolve`, { method: "POST" });
      await refreshAll();
    });

    wrapper.appendChild(header);
    wrapper.appendChild(meta);
    wrapper.appendChild(btn);
    alertsList.appendChild(wrapper);
  });
};

const renderActivity = (events) => {
  activityTable.innerHTML = "";
  if (!events?.length) {
    const row = document.createElement("tr");
    row.innerHTML = "<td colspan='4' class='muted'>No activity</td>";
    activityTable.appendChild(row);
    return;
  }

  events.forEach((ev) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${toLocalTime(ev.timestamp)}</td>
      <td>${ev.event_type ?? ""}</td>
      <td>${ev.state ?? ""}</td>
      <td>${ev.confidence != null ? ev.confidence.toFixed(2) : "—"}</td>
    `;
    activityTable.appendChild(row);
  });
};

const loadConfig = async () => {
  const res = await fetch("/api/config");
  const cfg = await res.json();
  alertThreshold.value = cfg.alert_confidence_threshold ?? "";
  highSeverity.value = cfg.high_severity_threshold ?? "";
  fallProbability.value = cfg.fall_probability ?? "";
  deviceId.value = cfg.device_id ?? "";
};

const saveConfig = async (event) => {
  event.preventDefault();
  configStatus.textContent = "Saving...";

  const payload = {
    alert_confidence_threshold: alertThreshold.value ? Number(alertThreshold.value) : null,
    high_severity_threshold: highSeverity.value ? Number(highSeverity.value) : null,
    fall_probability: fallProbability.value ? Number(fallProbability.value) : null,
    device_id: deviceId.value || null,
  };

  const res = await fetch("/api/config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    configStatus.textContent = "Saved";
  } else {
    configStatus.textContent = "Save failed";
  }

  setTimeout(() => {
    configStatus.textContent = "";
  }, 2000);
};

const refreshAll = async () => {
  const [statusRes, alertsRes, activityRes] = await Promise.all([
    fetch("/api/status"),
    fetch("/api/alerts?limit=10"),
    fetch("/api/activity?limit=30"),
  ]);

  const status = await statusRes.json();
  const alerts = await alertsRes.json();
  const activity = await activityRes.json();

  renderStatus(status);
  renderAlerts(alerts);
  renderActivity(activity);
};

configForm.addEventListener("submit", saveConfig);
refreshBtn.addEventListener("click", refreshAll);

(async () => {
  await loadConfig();
  await refreshAll();
  setInterval(refreshAll, 5000);
})();
