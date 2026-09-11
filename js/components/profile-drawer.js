const ProfileDrawer = {
  open() {
    var overlay = document.getElementById('profile-drawer-overlay');
    var panel = document.getElementById('profile-drawer-panel');
    var user = Auth.currentUser() || { name: 'Pengguna', email: '' };

    var avatarEl = document.getElementById('drawer-avatar-initials');
    var nameEl = document.getElementById('drawer-user-name');
    var emailEl = document.getElementById('drawer-user-email');

    if (avatarEl) avatarEl.textContent = Utils.initials(user.name);
    if (nameEl) nameEl.textContent = user.name || 'Pengguna';
    if (emailEl) emailEl.textContent = user.email || '';

    if (overlay && panel) {
      overlay.classList.add('is-open');
      panel.classList.add('is-open');
      document.body.classList.add('no-scroll');
    }
  },

  close() {
    var overlay = document.getElementById('profile-drawer-overlay');
    var panel = document.getElementById('profile-drawer-panel');
    if (overlay) overlay.classList.remove('is-open');
    if (panel) panel.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  },

  logout() {
    Modal.confirm({
      title: 'Keluar dari SEHATIN?',
      message: 'Kamu perlu masuk kembali untuk mengakses akunmu.',
      icon: 'fa-right-from-bracket',
      confirmText: 'Ya, Keluar',
      onConfirm: function() { Auth.logout(); }
    });
  },

  init() {
    var self = this;
    var closeBtn = document.getElementById('drawer-close-btn');
    var logoutBtn = document.getElementById('drawer-logout-btn');

    if (closeBtn) closeBtn.addEventListener('click', function() { self.close(); });
    if (logoutBtn) logoutBtn.addEventListener('click', function() { self.logout(); });

    var overlay = document.getElementById('profile-drawer-overlay');
    if (overlay) overlay.addEventListener('click', function() { self.close(); });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') self.close();
    });
  }
};

window.ProfileDrawer = ProfileDrawer;
