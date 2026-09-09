(function () {
  Auth.redirectIfLoggedIn();

  function setError(inputId, show) {
    const input = document.getElementById(inputId);
    const error = document.querySelector('[data-error-for="' + inputId + '"]');
    if (input) input.classList.toggle("has-error", show);
    if (error) error.classList.toggle("is-visible", show);
  }

  document.getElementById("register-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirm = document.getElementById("reg-confirm").value;
    const terms = document.getElementById("reg-terms").checked;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    setError("reg-name", name.length === 0);
    setError("reg-email", !emailValid);
    setError("reg-password", password.length < 6);
    setError("reg-confirm", confirm !== password || confirm.length === 0);
    setError("reg-terms", !terms);

    if (name.length === 0 || !emailValid || password.length < 6 || confirm !== password || !terms) return;

    const result = Auth.register({ name, email, password });
    if (!result.ok) {
      Toast.error(result.message);
      return;
    }
    Auth.login(email, password);
    Toast.success("Akun berhasil dibuat. Selamat bergabung di SEHATIN!");
    setTimeout(function () {
      window.location.href = "dashboard.html";
    }, 400);
  });
})();
