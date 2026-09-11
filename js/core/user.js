const User = {
  getCurrent() {
    return Auth.currentUser() || { name: 'Pengguna', email: '' };
  },
  
  getInitials() {
    var user = this.getCurrent();
    return Utils.initials(user.name);
  },
  
  getProfileImage() {
    var userData = Storage.get('sehatin_user', {});
    return userData.profileImage || null;
  },
  
  updateProfile(fields) {
    var user = this.getCurrent();
    if (!user || user.name === 'Pengguna') return false;
    var result = Auth.updateProfile(fields);
    if (result) {
      var updated = Auth.currentUser();
      if (updated) {
        var userData = Storage.get('sehatin_user', {});
        userData.name = updated.name || userData.name;
        userData.email = updated.email || userData.email;
        userData.phone = updated.phone || '';
        Storage.set('sehatin_user', userData);
      }
    }
    return result;
  },
  
  getAllStats() {
    var checks = HealthState.getHealthCheckHistory();
    var journals = HealthState.getJournalHistory();
    var activities = HealthState.getActivities();
    var hydration = HealthState.getHydration();
    return {
      checkCount: checks.length,
      journalCount: journals.length,
      activityCount: activities.length,
      waterToday: hydration.current || 0,
      lastCheck: checks.length > 0 ? checks[0].createdAt : null,
      lastJournal: journals.length > 0 ? journals[0].createdAt : null
    };
  }
};

window.User = User;