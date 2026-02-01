const statusBadge = document.getElementById("statusBadge");
const systemState = document.getElementById("systemState");
const lastUpdate = document.getElementById("lastUpdate");
const confidence = document.getElementById("confidence");
const paused = document.getElementById("paused");
const alertsList = document.getElementById("alertsList");
const activityTable = document.getElementById("activityTable");
const authBtn = document.getElementById("authBtn");
const simulateWalkBtn = document.getElementById("simulateWalkBtn");
const simulateFallBtn = document.getElementById("simulateFallBtn");
const exportLogsBtn = document.getElementById("exportLogsBtn");
const activityStrip = document.getElementById("activityStrip");
const activityPreview = document.getElementById("activityPreview");
const activityExpandBtn = document.getElementById("activityExpandBtn");
const activityDetails = document.getElementById("activityDetails");
const configAlertThreshold = document.getElementById("configAlertThreshold");
const configHighSeverity = document.getElementById("configHighSeverity");
const configFallProbability = document.getElementById("configFallProbability");
const configDeviceId = document.getElementById("configDeviceId");

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
  const state = data?.state || "Idle";
  statusBadge.textContent = state;
  statusBadge.className = `badge ${STATE_CLASSES[state] ?? ""}`.trim();
  systemState.textContent = state;
  lastUpdate.textContent = data?.last_update ? toLocalTime(data?.last_update) : "—";
  confidence.textContent = data?.confidence != null ? data.confidence.toFixed(2) : "0.0";
  paused.textContent = data?.system_paused ? "Yes" : "No";
};

const renderAlerts = (alerts) => {
  if (!alerts?.length) {
    alertsList.innerHTML = "<span class='muted'>No active alerts</span>";
    return;
  }

  alertsList.innerHTML = "";
  alerts.forEach((alert) => {
    const wrapper = document.createElement("div");
    wrapper.className = "alert-item";
    if (alert.status === "RESOLVED") {
      wrapper.classList.add("alert-resolved");
    }
    if (alert.status === "RESOLVED") {
      wrapper.classList.add("resolved");
    }

    const header = document.createElement("div");
    header.className = "alert-header";
    const statusLabel = alert.status === "ACTIVE" ? "Active" : alert.status === "ACKED" ? "Acknowleged" : alert.status === "RESOLVED" ? "Resolved" : (alert.status ?? "");
    header.innerHTML = `<span class="badge danger">ALERT</span><span>${statusLabel}</span>`;
    const meta = document.createElement("div");
    meta.className = "alert-meta";
    meta.innerHTML = `<span>${alert.device_id ?? ""}</span><span>${toLocalTime(alert.created_at)}</span>`;

    wrapper.appendChild(header);
    wrapper.appendChild(meta);

    if (alert.status === "ACTIVE") {
      const ackBtn = document.createElement("button");
      ackBtn.className = "alert-action-btn";
      ackBtn.textContent = "🚑";
      ackBtn.title = "Acknowledge";
      ackBtn.addEventListener("click", async () => {
        await authFetch(`/api/alerts/${alert.id}/ack`, { method: "POST" });
        await refreshAll();
      });
      wrapper.appendChild(ackBtn);

      const resolveBtn = document.createElement("button");
      resolveBtn.className = "alert-action-btn";
      resolveBtn.textContent = "👍";
      resolveBtn.title = "Resolve";
      resolveBtn.addEventListener("click", async () => {
        await authFetch(`/api/alerts/${alert.id}/resolve`, { method: "POST" });
        await refreshAll();
      });
      wrapper.appendChild(resolveBtn);
    } else if (alert.status === "ACKED") {
      const resolveBtn = document.createElement("button");
      resolveBtn.className = "alert-action-btn";
      resolveBtn.textContent = "👍";
      resolveBtn.title = "Resolve";
      resolveBtn.addEventListener("click", async () => {
        await authFetch(`/api/alerts/${alert.id}/resolve`, { method: "POST" });
        await refreshAll();
      });
      wrapper.appendChild(resolveBtn);
    }

    alertsList.appendChild(wrapper);
  });
};

const formatActivityState = (state) => {
  if (!state) return "";
  const normalized = String(state).toLowerCase();
  if (normalized === "danger") return "High Risk";
  if (normalized === "normal") return "Normal";
  return state;
};

const renderActivity = (events) => {
  activityTable.innerHTML = "";
  if (activityStrip) {
    activityStrip.innerHTML = "";
  }
  if (activityPreview) {
    activityPreview.innerHTML = "";
  }
  if (!events?.length) {
    const row = document.createElement("tr");
    row.innerHTML = "<td colspan='4' class='muted'>No recent activity</td>";
    activityTable.appendChild(row);
    if (activityPreview) {
      activityPreview.innerHTML = "<span class='muted'>No recent activity</span>";
    }
    return;
  }

  if (activityPreview) {
    events.slice(0, 4).forEach((ev) => {
      const item = document.createElement("div");
      item.className = "activity-preview-item";
      const label = document.createElement("span");
      label.className = "activity-preview-label";
      const eventType = (ev.event_type ?? "").toUpperCase();
      if (eventType === "FALL_CONFIRMED" || eventType === "FALL_SUSPECTED") {
        label.classList.add("is-fall");
        label.textContent = "Fall";
      } else if (eventType === "WALKING") {
        label.classList.add("is-walk");
        label.textContent = "Walk";
      } else {
        label.classList.add("is-walk");
        label.textContent = "Walk";
      }

      const meta = document.createElement("span");
      meta.className = "activity-preview-meta";
      meta.textContent = toLocalTime(ev.timestamp);

      item.appendChild(label);
      item.appendChild(meta);
      activityPreview.appendChild(item);
    });
  }

  if (activityStrip) {
    events.slice(0, 30).forEach((ev) => {
      const dot = document.createElement("div");
      dot.className = "activity-dot";
      if (ev.event_type === "FALL_CONFIRMED" || ev.event_type === "FALL_SUSPECTED") {
        dot.classList.add("fall");
      } else {
        dot.classList.add("walk");
      }
      dot.title = `${ev.event_type ?? ""} ${toLocalTime(ev.timestamp)}`.trim();
      activityStrip.appendChild(dot);
    });
  }

  events.forEach((ev) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${toLocalTime(ev.timestamp)}</td>
      <td>${ev.event_type ?? ""}</td>
      <td>${formatActivityState(ev.state)}</td>
      <td>${ev.confidence != null ? ev.confidence.toFixed(2) : "—"}</td>
    `;
    activityTable.appendChild(row);
  });
};

const loadConfig = async () => {
  if (!configAlertThreshold || !configHighSeverity || !configFallProbability || !configDeviceId) return;
  const res = await authFetch("/api/config");
  const cfg = await res.json();
  const defaults = {
    alert_confidence_threshold: 0.7,
    high_severity_threshold: 0.92,
    fall_probability: 0.04,
    device_id: "SIM_DEVICE_1",
  };

  const toNumber = (value, fallback) => {
    if (value === null || value === undefined || value === "") return fallback;
    const num = Number(value);
    return Number.isNaN(num) ? fallback : num;
  };

  configAlertThreshold.textContent = toNumber(cfg.alert_confidence_threshold, defaults.alert_confidence_threshold).toFixed(2);
  configHighSeverity.textContent = toNumber(cfg.high_severity_threshold, defaults.high_severity_threshold).toFixed(2);
  configFallProbability.textContent = toNumber(cfg.fall_probability, defaults.fall_probability).toFixed(2);
  configDeviceId.textContent = cfg.device_id || defaults.device_id;
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


if (simulateWalkBtn) {
  simulateWalkBtn.addEventListener("click", async () => {
    await authFetch("/api/simulate/walk", { method: "POST" });
    await refreshAll();
  });
}

if (simulateFallBtn) {
  simulateFallBtn.addEventListener("click", async () => {
    await authFetch("/api/simulate/fall", { method: "POST" });
    await refreshAll();
  });
}

if (exportLogsBtn) {
  exportLogsBtn.addEventListener("click", async () => {
    const res = await authFetch("/api/logs/export");
    if (!res.ok) return;
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.download = `lifebridge_logs_${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  });
}

if (activityExpandBtn && activityDetails) {
  activityExpandBtn.addEventListener("click", () => {
    activityDetails.open = !activityDetails.open;
  });
}

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
