const AppShell = {
  navItems: [
    { key: "dashboard", label: "Dashboard", icon: "fa-house", href: "dashboard.html", mobile: true, mobileLabel: "Beranda" },
    { key: "health-check", label: "Pemeriksaan", icon: "fa-clipboard-check", href: "health-check.html", mobile: true, mobileLabel: "Periksa" },
    { key: "health", label: "Kesehatan Saya", icon: "fa-heart-pulse", href: "health.html", mobile: true, mobileLabel: "Kesehatan" },
    { key: "journal", label: "Jurnal", icon: "fa-book-medical", href: "journal.html", mobile: false },
    { key: "facilities", label: "Fasilitas", icon: "fa-hospital", href: "facilities.html", mobile: true, mobileLabel: "Fasilitas" },
    { key: "library", label: "Pustaka", icon: "fa-book-open", href: "library.html", mobile: false },
    { key: "settings", label: "Pengaturan", icon: "fa-gear", href: "settings.html", mobile: false },
  ],

  init(activeKey, pageTitle) {
    if (!Auth.guard()) return;
    this.activeKey = activeKey;
    this.renderSidebar();
    this.renderTopbar(pageTitle);
    this.renderBottomNav();
    this.renderDrawer();
    this.bindGlobalEvents();
    this.applyCollapsedState();
    this.setupKeyboardFix();
  },

  renderSidebar() {
    const user = Auth.currentUser() || { name: "Pengguna" };
    const collapsed = Storage.get("sidebarCollapsed", false);
    const items = this.navItems
      .map((item) => {
        const active = item.key === this.activeKey ? " is-active" : "";
        return (
          '<a class="sidebar-nav-item' +
          active +
          '" href="' +
          item.href +
          '" data-tooltip="' +
          item.label +
          '"><i class="fa-solid ' +
          item.icon +
          '"></i><span class="sidebar-nav-label">' +
          item.label +
          "</span></a>"
        );
      })
      .join("");

    const sidebar = document.createElement("aside");
    sidebar.className = "sidebar desktop-only" + (collapsed ? " is-collapsed" : "");
    sidebar.id = "app-sidebar";
    sidebar.innerHTML =
      '<div class="sidebar-brand"><div class="sidebar-brand-mark">S</div><span class="sidebar-brand-text">SEHATIN</span></div>' +
      '<nav class="sidebar-nav">' +
      items +
      "</nav>" +
      '<div class="sidebar-footer">' +
      '<button class="sidebar-collapse-btn" id="sidebar-collapse-btn" aria-label="Ciutkan sidebar"><i class="fa-solid fa-angles-left"></i><span class="sidebar-nav-label">Ciutkan</span></button>' +
      '<div class="sidebar-user" id="sidebar-user-trigger"><div class="sidebar-avatar">' +
      Utils.initials(user.name) +
      '</div><div class="sidebar-user-info"><strong>' +
      Utils.escapeHtml(user.name) +
      "</strong><span>" +
      Utils.escapeHtml(user.email || "") +
      "</span></div></div>" +
      '<a class="sidebar-nav-item sidebar-logout" id="sidebar-logout-btn" href="#"><i class="fa-solid fa-right-from-bracket"></i><span class="sidebar-nav-label">Keluar</span></a>' +
      "</div>";

    const layout = document.getElementById("app-layout");
    layout.insertBefore(sidebar, layout.firstChild);

    Utils.qsa(".sidebar-nav-item[data-tooltip]", sidebar).forEach((el) => {
      el.addEventListener("mouseenter", (e) => this.showTooltip(e, el));
      el.addEventListener("mouseleave", () => this.hideTooltip());
    });

    document.getElementById("sidebar-collapse-btn").addEventListener("click", () => {
      const isCollapsed = sidebar.classList.toggle("is-collapsed");
      Storage.set("sidebarCollapsed", isCollapsed);
    });

    document.getElementById("sidebar-logout-btn").addEventListener("click", (e) => {
      e.preventDefault();
      this.confirmLogout();
    });

    document.getElementById("sidebar-user-trigger").addEventListener("click", () => {
      this.openDrawer();
    });
  },

  applyCollapsedState() {
    const collapsed = Storage.get("sidebarCollapsed", false);
    const sidebar = document.getElementById("app-sidebar");
    if (sidebar && collapsed) sidebar.classList.add("is-collapsed");
  },

  showTooltip(e, el) {
    const sidebar = document.getElementById("app-sidebar");
    if (!sidebar.classList.contains("is-collapsed")) return;
    let tooltip = document.getElementById("sidebar-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.id = "sidebar-tooltip";
      tooltip.className = "sidebar-tooltip";
      document.body.appendChild(tooltip);
    }
    tooltip.textContent = el.getAttribute("data-tooltip");
    const rect = el.getBoundingClientRect();
    tooltip.style.top = rect.top + rect.height / 2 - 14 + "px";
    tooltip.style.left = rect.right + 12 + "px";
    tooltip.classList.add("is-visible");
  },

  hideTooltip() {
    const tooltip = document.getElementById("sidebar-tooltip");
    if (tooltip) tooltip.classList.remove("is-visible");
  },

  renderTopbar(pageTitle) {
    const unread = HealthState.unreadNotifCount();
    const topbar = document.createElement("header");
    topbar.className = "topbar desktop-only";
    topbar.innerHTML =
      '<span class="topbar-title">' +
      pageTitle +
      "</span>" +
      '<div class="topbar-actions">' +
      '<div class="topbar-search" id="topbar-search-wrap" style="position:relative;">' +
      '<i class="fa-solid fa-magnifying-glass"></i>' +
      '<input type="text" id="topbar-search-input" placeholder="Cari fasilitas, artikel..." autocomplete="off" />' +
      '<div class="search-results-panel" id="topbar-search-results"></div>' +
      "</div>" +
      '<button class="btn-icon" id="topbar-notif-btn" aria-label="Notifikasi" style="position:relative;"><i class="fa-solid fa-bell"></i>' +
      (unread > 0 ? '<span class="dot-badge"></span>' : "") +
      '<div class="notif-panel" id="topbar-notif-panel"></div>' +
      "</button>" +
      '<button class="topbar-avatar-btn" id="topbar-avatar-btn" aria-label="Buka profil"><div class="sidebar-avatar">' +
      Utils.initials((Auth.currentUser() || {}).name) +
      "</div></button>" +
      "</div>";

    const main = document.getElementById("app-main-column");
    main.insertBefore(topbar, main.firstChild);

    const mobileHeader = document.createElement("header");
    mobileHeader.className = "mobile-header hide-desktop";
    mobileHeader.innerHTML =
      '<span class="mobile-header-title">' +
      pageTitle +
      "</span>" +
      '<div class="mobile-header-actions">' +
      '<button class="btn-icon" id="mobile-notif-btn" aria-label="Notifikasi" style="position:relative;"><i class="fa-solid fa-bell"></i>' +
      (unread > 0 ? '<span class="dot-badge"></span>' : "") +
      "</button>" +
      '<button class="topbar-avatar-btn" id="mobile-avatar-btn" aria-label="Buka profil"><div class="sidebar-avatar">' +
      Utils.initials((Auth.currentUser() || {}).name) +
      "</div></button>" +
      "</div>";
    main.insertBefore(mobileHeader, main.firstChild);

    document.getElementById("topbar-avatar-btn").addEventListener("click", () => this.openDrawer());
    document.getElementById("mobile-avatar-btn").addEventListener("click", () => this.openDrawer());
    document.getElementById("mobile-notif-btn").addEventListener("click", () => this.openDrawer("notif"));
    document.getElementById("topbar-notif-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleNotifPanel();
    });

    this.bindSearch();
  },

  toggleNotifPanel() {
    const panel = document.getElementById("topbar-notif-panel");
    const isVisible = panel.classList.contains("is-visible");
    this.renderNotifPanel(panel);
    panel.classList.toggle("is-visible", !isVisible);
  },

  renderNotifPanel(panel) {
    const list = HealthState.getNotifications();
    if (list.length === 0) {
      panel.innerHTML = '<div class="notif-panel-head">Notifikasi</div><div class="search-result-empty">Belum ada notifikasi.</div>';
      return;
    }
    const items = list
      .slice(0, 6)
      .map(
        (n) =>
          '<a class="notif-item' +
          (n.unread ? " is-unread" : "") +
          '" href="' +
          n.link +
          '" data-id="' +
          n.id +
          '"><div class="notif-icon"><i class="fa-solid ' +
          n.icon +
          '"></i></div><div class="notif-text"><p>' +
          Utils.escapeHtml(n.text) +
          '</p><span class="notif-time">' +
          Utils.timeAgo(n.time) +
          "</span></div></a>"
      )
      .join("");
    panel.innerHTML = '<div class="notif-panel-head">Notifikasi</div><div class="notif-list">' + items + "</div>";
    Utils.qsa(".notif-item", panel).forEach((el) => {
      el.addEventListener("click", () => {
        HealthState.markNotificationRead(el.getAttribute("data-id"));
      });
    });
  },

  bindSearch() {
    const input = document.getElementById("topbar-search-input");
    const panel = document.getElementById("topbar-search-results");
    if (!input) return;
    const run = Utils.debounce(() => {
      const term = input.value.trim().toLowerCase();
      if (!term) {
        panel.classList.remove("is-visible");
        return;
      }
      const results = SearchFeature.run(term);
      if (results.length === 0) {
        panel.innerHTML = '<div class="search-result-empty">Tidak ada hasil untuk "' + Utils.escapeHtml(input.value) + '"</div>';
      } else {
        panel.innerHTML = results
          .slice(0, 6)
          .map(
            (r) =>
              '<a class="search-result-item" href="' +
              r.href +
              '"><div class="icon-chip"><i class="fa-solid ' +
              r.icon +
              '"></i></div><div><strong>' +
              Utils.escapeHtml(r.title) +
              '</strong><div class="text-xsmall text-muted">' +
              r.type +
              "</div></div></a>"
          )
          .join("");
      }
      panel.classList.add("is-visible");
    }, 200);
    input.addEventListener("input", run);
    input.addEventListener("focus", run);
  },

  renderBottomNav() {
    const items = this.navItems.filter((i) => i.mobile);
    const nav = document.createElement("nav");
    nav.className = "bottom-nav hide-desktop";
    nav.id = "app-bottom-nav";
    nav.innerHTML = items
      .map((item) => {
        const active = item.key === this.activeKey ? " is-active" : "";
        return (
          '<a class="bottom-nav-item' +
          active +
          '" href="' +
          item.href +
          '"><i class="fa-solid ' +
          item.icon +
          '"></i><span>' +
          (item.mobileLabel || item.label) +
          "</span></a>"
        );
      })
      .join("")
      .concat(
        '<button class="bottom-nav-item" id="bottom-nav-profile"><i class="fa-solid fa-user"></i><span>Profil</span></button>'
      );
    document.body.appendChild(nav);
    document.getElementById("bottom-nav-profile").addEventListener("click", () => this.openDrawer());
  },

  renderDrawer() {
    const user = Auth.currentUser() || { name: "Pengguna", email: "" };
    const overlay = document.createElement("div");
    overlay.className = "drawer-overlay";
    overlay.id = "profile-drawer-overlay";
    const panel = document.createElement("aside");
    panel.className = "drawer-panel";
    panel.id = "profile-drawer-panel";
    panel.innerHTML =
      '<div class="drawer-header"><strong>Profil Saya</strong><button class="btn-icon" id="drawer-close-btn" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button></div>' +
      '<div class="drawer-body">' +
      '<div class="drawer-profile"><div class="drawer-avatar">' +
      Utils.initials(user.name) +
      "</div><strong>" +
      Utils.escapeHtml(user.name) +
      '</strong><span class="text-muted text-small">' +
      Utils.escapeHtml(user.email) +
      "</span></div>" +
      '<div class="drawer-menu">' +
      '<a class="drawer-menu-item" href="settings.html"><i class="fa-solid fa-user"></i><span>Profil</span><i class="fa-solid fa-chevron-right"></i></a>' +
      '<a class="drawer-menu-item" href="settings.html"><i class="fa-solid fa-gear"></i><span>Pengaturan</span><i class="fa-solid fa-chevron-right"></i></a>' +
      '<a class="drawer-menu-item" href="settings.html"><i class="fa-solid fa-heart-pulse"></i><span>Preferensi Kesehatan</span><i class="fa-solid fa-chevron-right"></i></a>' +
      '<a class="drawer-menu-item" href="settings.html"><i class="fa-solid fa-circle-question"></i><span>Bantuan</span><i class="fa-solid fa-chevron-right"></i></a>' +
      "</div></div>" +
      '<div class="drawer-footer"><button class="btn btn-danger btn-block" id="drawer-logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Keluar</button></div>';

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    document.getElementById("drawer-close-btn").addEventListener("click", () => this.closeDrawer());
    overlay.addEventListener("click", () => this.closeDrawer());
    document.getElementById("drawer-logout-btn").addEventListener("click", () => this.confirmLogout());
  },

  openDrawer() {
    document.getElementById("profile-drawer-overlay").classList.add("is-open");
    document.getElementById("profile-drawer-panel").classList.add("is-open");
    document.body.classList.add("no-scroll");
  },

  closeDrawer() {
    document.getElementById("profile-drawer-overlay").classList.remove("is-open");
    document.getElementById("profile-drawer-panel").classList.remove("is-open");
    document.body.classList.remove("no-scroll");
  },

  confirmLogout() {
    Modal.confirm({
      title: "Keluar dari SEHATIN?",
      message: "Kamu perlu masuk kembali untuk mengakses akunmu.",
      icon: "fa-right-from-bracket",
      confirmText: "Ya, Keluar",
      onConfirm: () => Auth.logout(),
    });
  },

  bindGlobalEvents() {
    document.addEventListener("click", (e) => {
      const notifPanel = document.getElementById("topbar-notif-panel");
      const notifBtn = document.getElementById("topbar-notif-btn");
      if (notifPanel && notifBtn && !notifBtn.contains(e.target)) {
        notifPanel.classList.remove("is-visible");
      }
      const searchPanel = document.getElementById("topbar-search-results");
      const searchWrap = document.getElementById("topbar-search-wrap");
      if (searchPanel && searchWrap && !searchWrap.contains(e.target)) {
        searchPanel.classList.remove("is-visible");
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeDrawer();
    });
  },

  setupKeyboardFix() {
    if (!window.visualViewport) return;
    const threshold = 120;
    const initialHeight = window.visualViewport.height;
    window.visualViewport.addEventListener("resize", () => {
      const heightDiff = initialHeight - window.visualViewport.height;
      if (heightDiff > threshold) {
        document.body.classList.add("keyboard-open");
      } else {
        document.body.classList.remove("keyboard-open");
      }
    });
  },
};

window.AppShell = AppShell;
