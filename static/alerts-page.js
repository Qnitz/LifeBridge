const authBtn = document.getElementById("authBtn");
const alertsList = document.getElementById("alertsList");

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
        await refreshAlerts();
      });
      wrapper.appendChild(ackBtn);

      const resolveBtn = document.createElement("button");
      resolveBtn.className = "alert-action-btn";
      resolveBtn.textContent = "👍";
      resolveBtn.title = "Resolve";
      resolveBtn.addEventListener("click", async () => {
        await authFetch(`/api/alerts/${alert.id}/resolve`, { method: "POST" });
        await refreshAlerts();
      });
      wrapper.appendChild(resolveBtn);
    } else if (alert.status === "ACKED") {
      const resolveBtn = document.createElement("button");
      resolveBtn.className = "alert-action-btn";
      resolveBtn.textContent = "👍";
      resolveBtn.title = "Resolve";
      resolveBtn.addEventListener("click", async () => {
        await authFetch(`/api/alerts/${alert.id}/resolve`, { method: "POST" });
        await refreshAlerts();
      });
      wrapper.appendChild(resolveBtn);
    }

    alertsList.appendChild(wrapper);
  });
};

const refreshAlerts = async () => {
  const res = await authFetch("/api/alerts?limit=20");
  if (!res.ok) return;
  const data = await res.json();
  renderAlerts(data);
};

(async () => {
  if (!getToken()) {
    window.location.href = "/login";
    return;
  }
  updateAuthButton();
  await refreshAlerts();
  setInterval(refreshAlerts, 5000);
})();
