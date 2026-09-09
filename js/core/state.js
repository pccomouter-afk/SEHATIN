const HealthState = {
  todayKey() {
    const d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  },
  getMetrics() {
    const stored = Storage.get("metrics_" + this.todayKey());
    if (stored) return stored;
    const seeded = { tidur: 85, hidrasi: 72, aktivitas: 90, mood: 78, stress: 70, recovery: 80 };
    Storage.set("metrics_" + this.todayKey(), seeded);
    return seeded;
  },
  setMetric(key, value) {
    const metrics = this.getMetrics();
    metrics[key] = Utils.clamp(Math.round(value), 0, 100);
    Storage.set("metrics_" + this.todayKey(), metrics);
    return metrics;
  },
  getScore() {
    const m = this.getMetrics();
    const values = [m.tidur, m.hidrasi, m.aktivitas, m.mood, m.stress, m.recovery];
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  },
  getScoreStatus(score) {
    if (score >= 85) return "Sangat baik";
    if (score >= 70) return "Baik";
    if (score >= 50) return "Cukup baik";
    return "Perlu perhatian";
  },
  getScoreYesterday() {
    return Storage.get("score_yesterday", 75);
  },
  getTrend() {
    const stored = Storage.get("trend7", null);
    if (stored) return stored;
    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const trend = days.map((d) => ({ day: d, score: 65 + Math.round(Math.random() * 25) }));
    trend[trend.length - 1].score = this.getScore();
    Storage.set("trend7", trend);
    return trend;
  },
  getDailyPlan() {
    const stored = Storage.get("dailyPlanProgress_" + this.todayKey());
    if (stored) return stored;
    const progress = { plan_water: 3, plan_steps: 4250, plan_rest: 2, plan_journal: 0 };
    Storage.set("dailyPlanProgress_" + this.todayKey(), progress);
    return progress;
  },
  setDailyPlan(progress) {
    Storage.set("dailyPlanProgress_" + this.todayKey(), progress);
  },
  getHydration() {
    return Storage.get("hydration_" + this.todayKey(), { current: 1400, target: 2000 });
  },
  addHydration(ml) {
    const data = this.getHydration();
    data.current = Math.max(0, data.current + ml);
    Storage.set("hydration_" + this.todayKey(), data);
    const plan = this.getDailyPlan();
    plan.plan_water = Math.min(5, Math.round((data.current / data.target) * 5));
    this.setDailyPlan(plan);
    return data;
  },
  getActivities() {
    return Storage.get("activities", []);
  },
  addActivity(activity) {
    const list = this.getActivities();
    list.unshift(Object.assign({ id: Utils.uid("act"), createdAt: Date.now() }, activity));
    Storage.set("activities", list);
    return list;
  },
  getJournalHistory() {
    return Storage.get("journalHistory", []);
  },
  addJournalEntry(entry) {
    const list = this.getJournalHistory();
    list.unshift(Object.assign({ id: Utils.uid("journal"), createdAt: Date.now() }, entry));
    Storage.set("journalHistory", list);
    const plan = this.getDailyPlan();
    plan.plan_journal = 1;
    this.setDailyPlan(plan);
    return list;
  },
  deleteJournalEntry(id) {
    const list = this.getJournalHistory().filter((e) => e.id !== id);
    Storage.set("journalHistory", list);
    return list;
  },
  getHealthCheckHistory() {
    return Storage.get("healthCheckHistory", []);
  },
  addHealthCheckResult(result) {
    const list = this.getHealthCheckHistory();
    list.unshift(Object.assign({ id: Utils.uid("check"), createdAt: Date.now() }, result));
    Storage.set("healthCheckHistory", list);
    return list;
  },
  deleteHealthCheckResult(id) {
    const list = this.getHealthCheckHistory().filter((e) => e.id !== id);
    Storage.set("healthCheckHistory", list);
    return list;
  },
  getFavoriteFacilities() {
    return Storage.get("favoriteFacilities", []);
  },
  toggleFavoriteFacility(id) {
    let favs = this.getFavoriteFacilities();
    if (favs.includes(id)) {
      favs = favs.filter((f) => f !== id);
    } else {
      favs.push(id);
    }
    Storage.set("favoriteFacilities", favs);
    return favs;
  },
  getSavedArticles() {
    return Storage.get("savedArticles", []);
  },
  toggleSavedArticle(id) {
    let saved = this.getSavedArticles();
    if (saved.includes(id)) {
      saved = saved.filter((s) => s !== id);
    } else {
      saved.push(id);
    }
    Storage.set("savedArticles", saved);
    return saved;
  },
  getSettings() {
    return Storage.get("settings", {
      notifDaily: true,
      notifJournal: true,
      notifWater: true,
      notifArticle: false,
      notifFacility: false,
      targetWater: 2.0,
      targetSleep: 8,
      targetActivity: 30,
      reminderTime: "20:00",
      appearance: "terang",
    });
  },
  setSettings(settings) {
    Storage.set("settings", settings);
    return settings;
  },
  getNotifications() {
    const stored = Storage.get("notifications", null);
    if (stored) return stored;
    Storage.set("notifications", MockData.notifications);
    return MockData.notifications;
  },
  markNotificationRead(id) {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) item.unread = false;
    Storage.set("notifications", list);
    return list;
  },
  unreadNotifCount() {
    return this.getNotifications().filter((n) => n.unread).length;
  },
};

window.HealthState = HealthState;
