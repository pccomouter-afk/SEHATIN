const Storage = {
  prefix: "sehatin_",
  set(key, value) {
    try {
      window.localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  },
  get(key, fallback) {
    try {
      const raw = window.localStorage.getItem(this.prefix + key);
      if (raw === null) return fallback !== undefined ? fallback : null;
      return JSON.parse(raw);
    } catch (err) {
      return fallback !== undefined ? fallback : null;
    }
  },
  remove(key) {
    window.localStorage.removeItem(this.prefix + key);
  },
  clear(preserveAuth) {
    const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(this.prefix));
    keys.forEach((k) => {
      if (preserveAuth && (k === this.prefix + "auth" || k === this.prefix + "currentUser")) return;
      window.localStorage.removeItem(k);
    });
  },
  sehatin_user: "user",
  sehatin_health_preferences: "settings",
  sehatin_comments: "comments",
};

window.Storage = Storage;
