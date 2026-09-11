const ProfileImage = {
  save(dataUrl) {
    var userData = Storage.get('sehatin_user', {});
    userData.profileImage = dataUrl;
    Storage.set('sehatin_user', userData);
    return dataUrl;
  },

  get() {
    var userData = Storage.get('sehatin_user', {});
    return userData.profileImage || null;
  },

  getInitials(name) {
    return Utils.initials(name || 'Pengguna');
  },

  updateAllAvatars(name) {
    var initials = this.getInitials(name);
    Utils.qsa('#topbar-avatar-initials, #mobile-avatar-initials, #sidebar-avatar-initials, #drawer-avatar-initials').forEach(function(el) {
      el.textContent = initials;
    });
  },

  renderAvatar(containerId, name) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var img = this.get();
    if (img) {
      container.innerHTML = '<img src="' + img + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="Profile" />';
    } else {
      container.textContent = this.getInitials(name);
    }
  }
};

window.ProfileImage = ProfileImage;
