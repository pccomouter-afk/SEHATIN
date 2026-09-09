(function () {
  Auth.redirectIfLoggedIn();

  function ensureDemoUser() {
    const users = Storage.get("users", []);
    if (!users.some((u) => u.email === "demo@sehatin.id")) {
      users.push({ id: Utils.uid("user"), name: "Hendra Saputra", email: "demo@sehatin.id", password: "sehatin123", phone: "", createdAt: Date.now() });
      Storage.set("users", users);
    }
  }
  ensureDemoUser();

  function setError(inputId, show) {
    const input = document.getElementById(inputId);
    const error = document.querySelector('[data-error-for="' + inputId + '"]');
    input.classList.toggle("has-error", show);
    if (error) error.classList.toggle("is-visible", show);
  }

  document.getElementById("login-password-toggle").addEventListener("click", function () {
    const input = document.getElementById("login-password");
    const icon = this.querySelector("i");
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    icon.className = isPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
  });

  document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    setError("login-email", !emailValid);
    setError("login-password", password.length === 0);
    if (!emailValid || password.length === 0) return;

    const result = Auth.login(email, password);
    if (!result.ok) {
      Toast.error(result.message);
      return;
    }
    Toast.success("Berhasil masuk. Selamat datang kembali!");
    setTimeout(function () {
      window.location.href = "dashboard.html";
    }, 400);
  });

  document.getElementById("demo-login-btn").addEventListener("click", function () {
    const result = Auth.login("demo@sehatin.id", "sehatin123");
    if (result.ok) {
      window.location.href = "dashboard.html";
    }
  });
})();
