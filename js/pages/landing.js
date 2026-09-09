(function () {
  if (Auth.isLoggedIn()) {
    Utils.qsa('a[href="pages/register.html"], a[href="pages/login.html"]').forEach((a) => {
      a.setAttribute("href", "pages/dashboard.html");
      if (a.textContent.trim() === "Mulai Sekarang" || a.textContent.trim() === "Masuk") {
        a.textContent = "Buka Dashboard";
      }
    });
  }
})();
