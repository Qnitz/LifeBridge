const authBtn = document.getElementById("authBtn");
const configForm = document.getElementById("configForm");
const configStatus = document.getElementById("configStatus");

const alertThreshold = document.getElementById("alertThreshold");
const highSeverity = document.getElementById("highSeverity");
const fallProbability = document.getElementById("fallProbability");
const deviceId = document.getElementById("deviceId");

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

const loadConfig = async () => {
  const res = await authFetch("/api/config");
  if (!res.ok) return;
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

  alertThreshold.value = toNumber(cfg.alert_confidence_threshold, defaults.alert_confidence_threshold).toFixed(2);
  highSeverity.value = toNumber(cfg.high_severity_threshold, defaults.high_severity_threshold).toFixed(2);
  fallProbability.value = toNumber(cfg.fall_probability, defaults.fall_probability).toFixed(2);
  deviceId.value = cfg.device_id || defaults.device_id;
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

configForm.addEventListener("submit", saveConfig);

(async () => {
  if (!getToken()) {
    window.location.href = "/login";
    return;
  }
  updateAuthButton();
  await loadConfig();
})();
