const Auth = {
  isLoggedIn() {
    return Storage.get("auth", false) === true;
  },
  currentUser() {
    return Storage.get("currentUser", null);
  },
  register(data) {
    const users = Storage.get("users", []);
    const exists = users.some((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      return { ok: false, message: "Email sudah terdaftar. Silakan masuk." };
    }
    const user = {
      id: Utils.uid("user"),
      name: data.name,
      email: data.email,
      password: data.password,
      phone: "",
      createdAt: Date.now(),
    };
    users.push(user);
    Storage.set("users", users);
    return { ok: true, user };
  },
  login(email, password) {
    const users = Storage.get("users", []);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      return { ok: false, message: "Email atau kata sandi tidak sesuai." };
    }
    Storage.set("auth", true);
    Storage.set("currentUser", { id: user.id, name: user.name, email: user.email, phone: user.phone || "" });
    return { ok: true, user };
  },
  logout() {
    Storage.remove("auth");
    Storage.remove("currentUser");
    window.location.href = this.isInPagesFolder() ? "../index.html" : "index.html";
  },
  isInPagesFolder() {
    return window.location.pathname.indexOf("/pages/") !== -1;
  },
  updateProfile(fields) {
    const user = this.currentUser();
    if (!user) return false;
    const users = Storage.get("users", []);
    const idx = users.findIndex((u) => u.id === user.id);
    const merged = Object.assign({}, user, fields);
    if (idx !== -1) {
      users[idx] = Object.assign({}, users[idx], fields);
      Storage.set("users", users);
    }
    Storage.set("currentUser", merged);
    return true;
  },
  guard() {
    if (!this.isLoggedIn()) {
      const loginPath = this.isInPagesFolder() ? "login.html" : "pages/login.html";
      window.location.href = loginPath;
      return false;
    }
    return true;
  },
  redirectIfLoggedIn() {
    if (this.isLoggedIn()) {
      const dashPath = this.isInPagesFolder() ? "dashboard.html" : "pages/dashboard.html";
      window.location.href = dashPath;
    }
  },
};

window.Auth = Auth;
