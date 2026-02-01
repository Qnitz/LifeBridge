const statusBadge = document.getElementById("statusBadge");
const systemState = document.getElementById("systemState");
const lastUpdate = document.getElementById("lastUpdate");
const confidence = document.getElementById("confidence");
const paused = document.getElementById("paused");
const alertsList = document.getElementById("alertsList");
const activityTable = document.getElementById("activityTable");
const authBtn = document.getElementById("authBtn");
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

const getToken = () => localStorage.getItem("token");

const updateAuthButton = () => {
  if (!authBtn) return;
  if (getToken()) {
    authBtn.textContent = "Logout";
    authBtn.onclick = () => {
      localStorage.removeItem("token");
      window.location.href = "/login";
    };
  } else {
    authBtn.textContent = "Login";
    authBtn.onclick = () => {
      window.location.href = "/login";
    };
  }
};

const authFetch = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  return res;
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

    wrapper.appendChild(header);
    wrapper.appendChild(meta);

    if (alert.status === "ACTIVE") {
      const ackBtn = document.createElement("button");
      ackBtn.className = "btn";
      ackBtn.textContent = "Ack";
      ackBtn.addEventListener("click", async () => {
        await authFetch(`/api/alerts/${alert.id}/ack`, { method: "POST" });
        await refreshAll();
      });
      wrapper.appendChild(ackBtn);

      const resolveBtn = document.createElement("button");
      resolveBtn.className = "btn";
      resolveBtn.textContent = "Resolve";
      resolveBtn.addEventListener("click", async () => {
        await authFetch(`/api/alerts/${alert.id}/resolve`, { method: "POST" });
        await refreshAll();
      });
      wrapper.appendChild(resolveBtn);
    } else if (alert.status === "ACKED") {
      const resolveBtn = document.createElement("button");
      resolveBtn.className = "btn";
      resolveBtn.textContent = "Resolve";
      resolveBtn.addEventListener("click", async () => {
        await authFetch(`/api/alerts/${alert.id}/resolve`, { method: "POST" });
        await refreshAll();
      });
      wrapper.appendChild(resolveBtn);
    }

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
  const res = await authFetch("/api/config");
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

  const res = await authFetch("/api/config", {
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
    authFetch("/api/status"),
    authFetch("/api/alerts?limit=10"),
    authFetch("/api/activity?limit=30"),
  ]);

  const status = await statusRes.json();
  const alerts = await alertsRes.json();
  const activity = await activityRes.json();

  renderStatus(status);
  renderAlerts(alerts);
  renderActivity(activity);
};

configForm.addEventListener("submit", saveConfig);

(async () => {
  if (!getToken()) {
    window.location.href = "/login";
    return;
  }
  updateAuthButton();
  await loadConfig();
  await refreshAll();
  setInterval(refreshAll, 5000);
})();
