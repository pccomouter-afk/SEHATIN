(function() {
  if (!Auth.guard()) return;
  Sidebar.init();
  NavbarTop.init('Preferensi Kesehatan');
  ProfileDrawer.init();
  BottomNav.init();
  Router.init();
  
  var prefs = HealthState.getSettings();
  document.getElementById('pref-water').value = prefs.targetWater;
  document.getElementById('pref-sleep').value = prefs.targetSleep;
  document.getElementById('pref-activity').value = prefs.targetActivity;
  document.getElementById('pref-reminder').value = prefs.reminderTime;
  
  Utils.qsa('[data-notif]').forEach(function(input) {
    var key = input.getAttribute('data-notif');
    input.checked = !!prefs[key];
    input.addEventListener('change', function() {
      var current = HealthState.getSettings();
      current[key] = this.checked;
      HealthState.setSettings(current);
      Toast.success('Pengaturan diperbarui.');
    });
  });
  
  document.getElementById('preferences-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var current = HealthState.getSettings();
    current.targetWater = parseFloat(document.getElementById('pref-water').value) || 2000;
    current.targetSleep = parseFloat(document.getElementById('pref-sleep').value) || 8;
    current.targetActivity = parseInt(document.getElementById('pref-activity').value, 10) || 30;
    current.reminderTime = document.getElementById('pref-reminder').value || '20:00';
    HealthState.setSettings(current);
    Toast.success('Preferensi kesehatan berhasil diperbarui.');
  });
  
  Utils.qsa('[data-pref]').forEach(function(input) {
    var key = input.getAttribute('data-pref');
    input.checked = !!prefs[key];
    input.addEventListener('change', function() {
      var current = HealthState.getSettings();
      current[key] = this.checked;
      HealthState.setSettings(current);
      Toast.success('Pengaturan notifikasi diperbarui.');
    });
  });
})();