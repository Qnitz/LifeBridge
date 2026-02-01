const authBtn = document.getElementById("authBtn");
const activityTable = document.getElementById("activityTable");
const activityStrip = document.getElementById("activityStrip");

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

const renderActivity = (events) => {
  activityTable.innerHTML = "";
  activityStrip.innerHTML = "";

  if (!events?.length) {
    const row = document.createElement("tr");
    row.innerHTML = "<td colspan='4' class='muted'>No recent activity</td>";
    activityTable.appendChild(row);
    return;
  }

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

const refreshActivity = async () => {
  const res = await authFetch("/api/activity?limit=30");
  if (!res.ok) return;
  const data = await res.json();
  renderActivity(data);
};

(async () => {
  if (!getToken()) {
    window.location.href = "/login";
    return;
  }
  updateAuthButton();
  await refreshActivity();
  setInterval(refreshActivity, 5000);
})();
