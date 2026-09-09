const Utils = {
  qs(selector, scope) {
    return (scope || document).querySelector(selector);
  },
  qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  },
  formatDate(date) {
    const d = new Date(date);
    const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return d.getDate() + " " + bulan[d.getMonth()] + " " + d.getFullYear();
  },
  formatTime(date) {
    const d = new Date(date);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return h + ":" + m;
  },
  timeAgo(date) {
    const diffMs = Date.now() - new Date(date).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return diffMin + " menit lalu";
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return diffHour + " jam lalu";
    const diffDay = Math.floor(diffHour / 24);
    return diffDay + " hari lalu";
  },
  uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  },
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },
  initials(name) {
    if (!name) return "S";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },
  debounce(fn, delay) {
    let timer = null;
    return function () {
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(null, args);
      }, delay);
    };
  },
  greetingByHour() {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  },
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text === undefined || text === null ? "" : String(text);
    return div.innerHTML;
  },
};

window.Utils = Utils;
