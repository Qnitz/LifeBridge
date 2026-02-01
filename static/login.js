const form = document.getElementById("loginForm");
const statusEl = document.getElementById("loginStatus");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusEl.textContent = "Signing in...";

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      statusEl.textContent = "Invalid credentials";
      return;
    }

    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    statusEl.textContent = "Success. Redirecting...";
    setTimeout(() => {
      window.location.href = "/";
    }, 600);
  } catch (err) {
    statusEl.textContent = "Login failed";
  }
});
