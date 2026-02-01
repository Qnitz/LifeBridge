const authBtn = document.getElementById("authBtn");
const statusBadge = document.getElementById("statusBadge");
const systemState = document.getElementById("systemState");
const lastUpdate = document.getElementById("lastUpdate");
const confidence = document.getElementById("confidence");
const paused = document.getElementById("paused");

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

const refreshStatus = async () => {
  const res = await authFetch("/api/status");
  if (!res.ok) return;
  const data = await res.json();
  renderStatus(data);
};

(async () => {
  if (!getToken()) {
    window.location.href = "/login";
    return;
  }
  updateAuthButton();
  await refreshStatus();
  setInterval(refreshStatus, 5000);
})();
