(function() {
  if (!Auth.guard()) return;
  Sidebar.init();
  NavbarTop.init('Profil');
  ProfileDrawer.init();
  BottomNav.init();
  Router.init();
  
  var user = Auth.currentUser() || { name: 'Pengguna', email: '', phone: '' };
  
  document.getElementById('profile-name').value = user.name || '';
  document.getElementById('profile-email').value = user.email || '';
  document.getElementById('profile-phone').value = user.phone || '';
  document.getElementById('profile-name-display').textContent = user.name || 'Pengguna';
  document.getElementById('profile-email-display').textContent = user.email || '';
  
  ProfileImage.renderAvatar('profile-image-display', user.name);
  
  document.getElementById('profile-upload-btn').addEventListener('click', function() {
    document.getElementById('profile-image-input').click();
  });
  
  document.getElementById('profile-image-input').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(event) {
      ProfileImage.save(event.target.result);
      ProfileImage.renderAvatar('profile-image-display', user.name);
      ProfileImage.updateAllAvatars(user.name);
      Toast.success('Foto profil berhasil diperbarui.');
    };
    reader.readAsDataURL(file);
  });
  
  document.getElementById('profile-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var name = document.getElementById('profile-name').value.trim();
    var email = document.getElementById('profile-email').value.trim();
    var phone = document.getElementById('profile-phone').value.trim();
    
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Toast.error('Pastikan nama dan email terisi dengan benar.');
      return;
    }
    
    User.updateProfile({ name: name, email: email, phone: phone });
    document.getElementById('profile-name-display').textContent = name;
    document.getElementById('profile-email-display').textContent = email;
    ProfileImage.updateAllAvatars(name);
    Toast.success('Profil berhasil diperbarui.');
  });
  
  var stats = User.getAllStats();
  var statsEl = document.getElementById('profile-stats');
  if (statsEl) {
    if (stats.checkCount === 0 && stats.journalCount === 0 && stats.activityCount === 0) {
      statsEl.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-chart-line"></i></div><p>Belum ada data aktivitas.</p><a href="health-check.html" class="btn btn-primary btn-sm">Mulai Pemeriksaan</a></div>';
    } else {
      statsEl.innerHTML = '<div class="grid grid-2">' +
        '<div class="metric-card"><span class="metric-label">Pemeriksaan</span><span class="metric-value">' + stats.checkCount + '</span></div>' +
        '<div class="metric-card"><span class="metric-label">Jurnal</span><span class="metric-value">' + stats.journalCount + '</span></div>' +
        '<div class="metric-card"><span class="metric-label">Aktivitas</span><span class="metric-value">' + stats.activityCount + '</span></div>' +
        '</div>';
    }
  }
})();