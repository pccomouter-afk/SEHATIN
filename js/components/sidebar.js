const Sidebar = {
  init() {
    this.render();
    this.bindEvents();
    this.applyActiveState();
    this.applyCollapsedState();
  },

  render() {
    var user = Auth.currentUser() || { name: 'Pengguna', email: '' };
    var collapsed = Storage.get('sidebarCollapsed', false);

    var items = [
      { key: 'dashboard', label: 'Dashboard', icon: 'fa-house', href: 'dashboard.html' },
      { key: 'health-check', label: 'Pemeriksaan', icon: 'fa-clipboard-check', href: 'health-check.html' },
      { key: 'health', label: 'Kesehatan Saya', icon: 'fa-heart-pulse', href: 'health.html' },
      { key: 'journal', label: 'Jurnal', icon: 'fa-book-medical', href: 'journal.html' },
      { key: 'facilities', label: 'Fasilitas', icon: 'fa-hospital', href: 'facilities.html' },
      { key: 'library', label: 'Pustaka', icon: 'fa-book-open', href: 'library.html' },
      { key: 'settings', label: 'Pengaturan', icon: 'fa-gear', href: 'settings.html' }
    ];

    var sidebarItems = items.map(function(item) {
      return '<a class="sidebar-nav-item" href="' + item.href + '" data-nav-key="' + item.key + '"><i class="fa-solid ' + item.icon + '"></i><span class="sidebar-nav-label">' + item.label + '</span></a>';
    }).join('');

    var sidebar = document.getElementById('app-sidebar');
    if (sidebar) return;

    var layout = document.getElementById('app-layout');
    var sidebarEl = document.createElement('aside');
    sidebarEl.className = 'sidebar desktop-only' + (collapsed ? ' is-collapsed' : '');
    sidebarEl.id = 'app-sidebar';
    sidebarEl.innerHTML = '<div class="sidebar-brand"><div class="sidebar-brand-mark">S</div><span class="sidebar-brand-text">SEHATIN</span></div>' +
      '<nav class="sidebar-nav">' + sidebarItems + '</nav>' +
      '<div class="sidebar-footer">' +
      '<div class="sidebar-user" id="sidebar-user-trigger">' +
      '<div class="sidebar-avatar" id="sidebar-avatar-initials">' + Utils.initials(user.name) + '</div>' +
      '<div class="sidebar-user-info"><strong id="sidebar-user-name">' + Utils.escapeHtml(user.name) + '</strong><span id="sidebar-user-email">' + Utils.escapeHtml(user.email || '') + '</span></div>' +
      '</div>' +
      '<a class="sidebar-nav-item sidebar-logout" id="sidebar-logout-btn" href="#"><i class="fa-solid fa-right-from-bracket"></i><span class="sidebar-nav-label">Keluar</span></a>' +
      '</div>';

    if (layout) layout.insertBefore(sidebarEl, layout.firstChild);

    var navItems = Utils.qsa('.sidebar-nav-item[data-nav-key]', sidebarEl);
    navItems.forEach(function(el) {
      el.addEventListener('mouseenter', function() {
        var sb = document.getElementById('app-sidebar');
        if (sb && sb.classList.contains('is-collapsed')) {
          var tooltip = document.getElementById('sidebar-tooltip');
          if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'sidebar-tooltip';
            tooltip.className = 'sidebar-tooltip';
            document.body.appendChild(tooltip);
          }
          tooltip.textContent = el.getAttribute('data-tooltip') || el.querySelector('.sidebar-nav-label').textContent;
          var rect = el.getBoundingClientRect();
          tooltip.style.top = rect.top + rect.height / 2 - 14 + 'px';
          tooltip.style.left = rect.right + 12 + 'px';
          tooltip.classList.add('is-visible');
        }
      });
      el.addEventListener('mouseleave', function() {
        var tooltip = document.getElementById('sidebar-tooltip');
        if (tooltip) tooltip.classList.remove('is-visible');
      });
    });
  },

  bindEvents() {
    var self = this;
    var collapseBtn = document.getElementById('sidebar-collapse-btn');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', function() {
        var sidebar = document.getElementById('app-sidebar');
        if (sidebar) {
          var isCollapsed = sidebar.classList.toggle('is-collapsed');
          Storage.set('sidebarCollapsed', isCollapsed);
        }
      });
    }

    var logoutBtn = document.getElementById('sidebar-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        ProfileDrawer.logout();
      });
    }

    var userTrigger = document.getElementById('sidebar-user-trigger');
    if (userTrigger) {
      userTrigger.addEventListener('click', function() {
        ProfileDrawer.open();
      });
    }
  },

  applyActiveState() {
    var path = window.location.pathname;
    var activeKey = null;
    if (path.indexOf('dashboard.html') !== -1) activeKey = 'dashboard';
    else if (path.indexOf('health-check.html') !== -1) activeKey = 'health-check';
    else if (path.indexOf('health.html') !== -1) activeKey = 'health';
    else if (path.indexOf('journal.html') !== -1) activeKey = 'journal';
    else if (path.indexOf('facilities.html') !== -1) activeKey = 'facilities';
    else if (path.indexOf('library.html') !== -1) activeKey = 'library';
    else if (path.indexOf('settings.html') !== -1) activeKey = 'settings';
    else if (path.indexOf('profile.html') !== -1) activeKey = 'settings';
    else if (path.indexOf('health-preferences.html') !== -1) activeKey = 'settings';
    else if (path.indexOf('help.html') !== -1) activeKey = 'settings';

    Utils.qsa('.sidebar-nav-item').forEach(function(item) {
      item.classList.remove('is-active');
      if (item.getAttribute('href') && activeKey && item.getAttribute('href').indexOf(activeKey) !== -1) {
        item.classList.add('is-active');
      }
    });
  },

  applyCollapsedState() {
    var collapsed = Storage.get('sidebarCollapsed', false);
    var sidebar = document.getElementById('app-sidebar');
    if (sidebar && collapsed) sidebar.classList.add('is-collapsed');
  }
};

window.Sidebar = Sidebar;
