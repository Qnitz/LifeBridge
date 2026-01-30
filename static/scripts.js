const API = {
  status: "/api/status",
  activity: "/api/activity?limit=30",
  alerts: "/api/alerts?limit=10",
  resolve: "/api/alerts"
};

let sensorChart = null;

// --- 1. CHART CONFIGURATION ---
function initChart() {
  const ctx = document.getElementById('activityChart').getContext('2d');
  sensorChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        { label: 'X (Side)', data: [], borderColor: '#e74c3c', borderWidth: 2, tension: 0.4, fill: false, pointRadius: 0 },
        { label: 'Y (Gravity)', data: [], borderColor: '#2ecc71', borderWidth: 2, tension: 0.4, fill: false, pointRadius: 0 },
        { label: 'Z (Forward)', data: [], borderColor: '#3498db', borderWidth: 2, tension: 0.4, fill: false, pointRadius: 0 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      interaction: { intersect: false },
      scales: {
        y: {
          min: -5,
          max: 20,
          grid: { color: '#f0f0f0' },
          title: { display: true, text: 'Acceleration (m/s²)' }
        },
        x: { display: false }
      },
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 10 } }
      }
    }
  });
}

// --- HELPERS ---
function formatTime(isoString) {
  if (!isoString) return "-";
  if (!isoString.endsWith("Z")) isoString += "Z";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

async function fetchJson(url) {
  try {
    const r = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);

    const dot = document.getElementById("connection-status");
    if (dot) dot.className = "status-dot connected";

    return await r.json();
  } catch (e) {
    const dot = document.getElementById("connection-status");
    if (dot) dot.className = "status-dot disconnected";
    throw e;
  }
}

// --- 2. ACTIVITY LOOP ---
async function refreshActivity() {
  try {
    const rows = await fetchJson(API.activity);
    const chartData = rows.slice().reverse();

    if (sensorChart) {
      sensorChart.data.labels = chartData.map(r => formatTime(r.timestamp));
      sensorChart.data.datasets[0].data = chartData.map(r => r.raw_data ? r.raw_data.x : 0);
      sensorChart.data.datasets[1].data = chartData.map(r => r.raw_data ? r.raw_data.y : 0);
      sensorChart.data.datasets[2].data = chartData.map(r => r.raw_data ? r.raw_data.z : 0);
      sensorChart.update();
    }
  } catch (e) { console.error(e); }
}

// --- 3. STATUS LOOP ---
async function refreshStatus() {
  try {
    const s = await fetchJson(API.status);
    const panel = document.getElementById("status-panel");
    const content = document.getElementById("status-content");
    const overlay = document.getElementById("chart-overlay");

    if (s.system_paused) {
      // EMERGENCY MODE
      panel.classList.add("emergency-mode");
      if (overlay) overlay.classList.remove("hidden");

      let buttonHtml = `<p>Loading...</p>`;
      try {
        const alerts = await fetchJson(API.alerts);
        const active = alerts.find(a => a.status === "ACTIVE" && a.severity === "HIGH");
        if (active) {
          buttonHtml = `<button class="ok-button" onclick="ackAlert(${active.id})">I AM OKAY - RESUME</button>`;
        } else {
          buttonHtml = `<p>System paused. Check alerts below.</p>`;
        }
      }
      catch (e) { console.error(e); }


      content.innerHTML = `
                <h2 style="border:none; color:#dc3545; font-size: 1.5em; margin-bottom: 10px;">⚠️ FALL DETECTED</h2>
                <p style="font-size: 1.1em; color: #b00020; margin-bottom: 20px;">
                    High impact detected. System paused.
                </p>
                ${buttonHtml}
            `;

    } else {
      // NORMAL MODE
      panel.classList.remove("emergency-mode");
      if (overlay) overlay.classList.add("hidden");

      content.innerHTML = `
                <div style="display:flex; justify-content:space-around; align-items:center;">
                    <div>
                        <div style="font-size:0.9em; color:#777;">Current State</div>
                        <div style="font-size:1.5em; font-weight:bold; color:#2c3e50;">${s.state}</div>
                    </div>
                    <div>
                        <div style="font-size:0.9em; color:#777;">Last Update</div>
                        <div style="font-size:1.2em;">${formatTime(s.last_update)}</div>
                    </div>
                </div>
            `;
    }
  } catch (e) { console.error(e); }
}

// --- 4. ALERTS LOOP ---
async function refreshAlerts() {
  try {
    const rows = await fetchJson(API.alerts);
    const html = rows.map(a => `
            <div style="padding:15px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; background:${a.severity === 'HIGH' ? '#fff5f5' : 'white'}">
                <div>
                    <span style="font-weight:bold; padding: 4px 8px; border-radius:4px; color:white; background-color:${a.severity === 'HIGH' ? '#dc3545' : '#f39c12'}">
                        ${a.severity}
                    </span>
                    <span style="margin-left: 10px; font-weight: 500; color: #333;">
                        ${a.severity === 'HIGH' ? '📲 Alert sent to Caregiver' : '⚠️ Suspicious Movement'}
                    </span>
                    <div style="font-size:0.85em; color:#999; margin-top:5px;">
                        ${formatTime(a.created_at)}
                    </div>
                </div>
                ${a.status === 'ACTIVE' ? `<button class="ok-button" style="padding:5px 15px; font-size:0.9em;" onclick="ackAlert(${a.id})">Ack</button>` : '<span style="color:green; font-size:0.9em;">Resolved</span>'}
            </div>
        `).join("");

    document.getElementById("alerts-content").innerHTML = html || "<p style='padding:20px; color:#777; text-align:center;'>No active alerts.</p>";
  } catch (e) { }
}

// --- UPDATED: INSTANT ACKNOWLEDGE (No Popup) ---
async function ackAlert(id) {
  // Removed the confirm() popup. Executes immediately.
  try {
    await fetch(`/api/alerts/${id}/resolve`, { method: "POST" });
    await tick(); // Force immediate refresh
  } catch (e) {
    alert("Error acknowledging: " + e.message);
  }
}

async function tick() {
  await refreshStatus();
  await refreshActivity();
  await refreshAlerts();
}

window.addEventListener("load", () => {
  initChart();
  tick();
  setInterval(tick, 500); // High-speed refresh
});