const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginStatus = document.getElementById("loginStatus");
const registerStatus = document.getElementById("registerStatus");
const tabs = document.querySelectorAll(".auth-tab");

const setActiveForm = (targetId) => {
  tabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.target === targetId);
  });
  loginForm.classList.toggle("is-hidden", targetId !== "loginForm");
  registerForm.classList.toggle("is-hidden", targetId !== "registerForm");
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setActiveForm(tab.dataset.target));
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginStatus.textContent = "Signing in...";

  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      loginStatus.textContent = "Invalid credentials";
      return;
    }

    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    loginStatus.textContent = "Success. Redirecting...";
    setTimeout(() => {
      window.location.href = "/";
    }, 600);
  } catch (err) {
    loginStatus.textContent = "Login failed";
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  registerStatus.textContent = "Creating account...";

  const formData = new FormData(registerForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      registerStatus.textContent = res.status === 409 ? "Username already exists" : "Register failed";
      return;
    }

    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    registerStatus.textContent = "Account created. Redirecting...";
    setTimeout(() => {
      window.location.href = "/";
    }, 600);
  } catch (err) {
    registerStatus.textContent = "Register failed";
  }
});
