const NavbarTop = {
  init(pageTitle) {
    this.render(pageTitle);
    this.bindEvents();
  },

  render(pageTitle) {
    var user = Auth.currentUser() || { name: 'Pengguna' };
    var unread = HealthState.unreadNotifCount();

    var topbar = document.createElement('header');
    topbar.className = 'topbar desktop-only';
    topbar.innerHTML = '<span class="topbar-title">' + pageTitle + '</span>' +
      '<div class="topbar-actions">' +
      '<div class="topbar-search" id="topbar-search-wrap" style="position:relative;">' +
      '<i class="fa-solid fa-magnifying-glass"></i>' +
      '<input type="text" id="topbar-search-input" placeholder="Cari fasilitas, artikel..." autocomplete="off" />' +
      '<div class="search-results-panel" id="topbar-search-results"></div>' +
      '</div>' +
      '<button class="btn-icon" id="topbar-notif-btn" aria-label="Notifikasi" style="position:relative;"><i class="fa-solid fa-bell"></i>' +
      (unread > 0 ? '<span class="dot-badge"></span>' : '') +
      '</button>' +
      '<button class="topbar-avatar-btn" id="topbar-avatar-btn" aria-label="Buka profil">' +
      '<div class="sidebar-avatar" id="topbar-avatar-initials">' + Utils.initials(user.name) + '</div>' +
      '</button>' +
      '</div>';

    var main = document.getElementById('app-main-column');
    if (main && !document.getElementById('topbar')) {
      main.insertBefore(topbar, main.firstChild);
    }

    var mobileHeader = document.createElement('header');
    mobileHeader.className = 'mobile-header hide-desktop';
    mobileHeader.innerHTML = '<span class="mobile-header-title">' + pageTitle + '</span>' +
      '<div class="mobile-header-actions">' +
      '<button class="btn-icon" id="mobile-notif-btn" aria-label="Notifikasi" style="position:relative;"><i class="fa-solid fa-bell"></i>' +
      (unread > 0 ? '<span class="dot-badge"></span>' : '') +
      '</button>' +
      '<button class="topbar-avatar-btn" id="mobile-avatar-btn" aria-label="Buka profil">' +
      '<div class="sidebar-avatar" id="mobile-avatar-initials">' + Utils.initials(user.name) + '</div>' +
      '</button>' +
      '</div>';

    if (main && !document.getElementById('mobile-header')) {
      main.insertBefore(mobileHeader, main.firstChild);
    }
  },

  bindEvents() {
    var self = this;
    document.getElementById('topbar-avatar-btn').addEventListener('click', function() { self.openDrawer(); });
    document.getElementById('mobile-avatar-btn').addEventListener('click', function() { self.openDrawer(); });
    document.getElementById('mobile-notif-btn').addEventListener('click', function() { self.openDrawer('notif'); });

    var notifBtn = document.getElementById('topbar-notif-btn');
    if (notifBtn) {
      notifBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        self.toggleNotifPanel();
      });
    }

    this.bindSearch();
  },

  bindSearch() {
    var input = document.getElementById('topbar-search-input');
    var panel = document.getElementById('topbar-search-results');
    if (!input) return;

    var run = Utils.debounce(function() {
      var term = input.value.trim().toLowerCase();
      if (!term) { panel.classList.remove('is-visible'); return; }
      var results = SearchFeature.run(term);
      if (results.length === 0) {
        panel.innerHTML = '<div class="search-result-empty">Tidak ada hasil untuk "' + Utils.escapeHtml(input.value) + '"</div>';
      } else {
        panel.innerHTML = results.slice(0, 6).map(function(r) {
          return '<a class="search-result-item" href="' + r.href + '"><div class="icon-chip"><i class="fa-solid ' + r.icon + '"></i></div><div><strong>' + Utils.escapeHtml(r.title) + '</strong><div class="text-xsmall text-muted">' + r.type + '</div></div></a>';
        }).join('');
      }
      panel.classList.add('is-visible');
    }, 200);

    input.addEventListener('input', run);
    input.addEventListener('focus', run);
  },

  toggleNotifPanel() {
    var panel = document.getElementById('topbar-notif-panel');
    var isVisible = panel && panel.classList.contains('is-visible');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'notif-panel';
      panel.id = 'topbar-notif-panel';
      document.body.appendChild(panel);
    }
    this.renderNotifPanel(panel);
    panel.classList.toggle('is-visible', !isVisible);
  },

  renderNotifPanel(panel) {
    var list = HealthState.getNotifications();
    if (list.length === 0) {
      panel.innerHTML = '<div class="notif-panel-head">Notifikasi</div><div class="search-result-empty">Belum ada notifikasi.</div>';
      return;
    }
    var items = list.slice(0, 6).map(function(n) {
      return '<a class="notif-item' + (n.unread ? ' is-unread' : '') + '" href="' + n.link + '" data-id="' + n.id + '"><div class="notif-icon"><i class="fa-solid ' + n.icon + '"></i></div><div class="notif-text"><p>' + Utils.escapeHtml(n.text) + '</p><span class="notif-time">' + Utils.timeAgo(n.time) + '</span></div></a>';
    }).join('');
    panel.innerHTML = '<div class="notif-panel-head">Notifikasi</div><div class="notif-list">' + items + '</div>';
  },

  openDrawer() { this.openDrawer(); },
  openDrawer(type) {
    var overlay = document.getElementById('profile-drawer-overlay');
    var panel = document.getElementById('profile-drawer-panel');
    if (overlay && panel) {
      overlay.classList.add('is-open');
      panel.classList.add('is-open');
      document.body.classList.add('no-scroll');
    }
  },

  closeDrawer() {
    var overlay = document.getElementById('profile-drawer-overlay');
    var panel = document.getElementById('profile-drawer-panel');
    if (overlay) overlay.classList.remove('is-open');
    if (panel) panel.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  }
};

window.NavbarTop = NavbarTop;
