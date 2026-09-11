const HealthState = {
  todayKey() {
    const d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  },
  getMetrics() {
    return Storage.get("metrics", null);
  },
  setMetric(key, value) {
    const metrics = this.getMetrics() || {tidur: 0, hidrasi: 0, aktivitas: 0, mood: 0, stress: 0, recovery: 0};
    metrics[key] = Utils.clamp(Math.round(value), 0, 100);
    Storage.set("metrics", metrics);
    return metrics;
  },
  getScore() {
    const m = this.getMetrics();
    if (!m) return null;
    const values = [m.tidur, m.hidrasi, m.aktivitas, m.mood, m.stress, m.recovery].filter(function(v) { return v > 0; });
    if (values.length === 0) return null;
    const avg = Math.round(values.reduce(function(a, b) { return a + b; }, 0) / values.length);
    return {score: avg, status: this.getScoreStatus(avg)};
  },
  getScoreStatus(score) {
    if (score >= 85) return "Sangat baik";
    if (score >= 70) return "Baik";
    if (score >= 50) return "Cukup baik";
    return "Perlu perhatian";
  },
  getHealthScore() {
    const hydration = this.getHydration();
    const activities = this.getActivities();
    const sleep = Storage.get("sleep", null);
    const journal = this.getJournalHistory();
    const metrics = this.getMetrics();
    const subScores = [];
    if (hydration && hydration.current > 0 && hydration.target > 0) {
      subScores.push(Utils.clamp(Math.round((hydration.current / hydration.target) * 100), 0, 100));
    }
    if (activities && activities.length > 0) {
      var actValues = activities.map(function(a) { return a.score || a.value || 50; });
      if (actValues.length > 0) {
        subScores.push(Math.round(actValues.reduce(function(a, b) { return a + b; }, 0) / actValues.length));
      }
    }
    if (sleep && (sleep.hours || sleep.duration)) {
      var sleepHours = sleep.hours || sleep.duration;
      if (sleepHours >= 7 && sleepHours <= 9) subScores.push(100);
      else if (sleepHours >= 6 || sleepHours <= 10) subScores.push(70);
      else subScores.push(40);
    }
    if (metrics && metrics.tidur > 0) {
      subScores.push(metrics.tidur);
    }
    if (metrics && metrics.mood > 0) {
      subScores.push(metrics.mood);
    }
    if (journal && journal.length > 0) {
      var moodValues = journal.filter(function(j) { return j.mood !== undefined; }).map(function(j) { return j.mood; });
      if (moodValues.length > 0) {
        subScores.push(Math.round(moodValues.reduce(function(a, b) { return a + b; }, 0) / moodValues.length));
      }
    }
    if (subScores.length === 0) return null;
    var score = Math.round(subScores.reduce(function(a, b) { return a + b; }, 0) / subScores.length);
    return {score: score, status: this.getScoreStatus(score)};
  },
  getDailyPlan() {
    const stored = Storage.get("dailyplan", null);
    if (stored) return stored;
    var progress = {plan_water: 0, plan_steps: 0, plan_rest: 0, plan_journal: 0};
    Storage.set("dailyplan", progress);
    return progress;
  },
  setDailyPlan(progress) {
    Storage.set("dailyplan", progress);
  },
  getHydration() {
    return Storage.get("hydration", {current: 0, target: 2000});
  },
  addHydration(ml) {
    const data = this.getHydration();
    data.current = Math.max(0, data.current + ml);
    Storage.set("hydration", data);
    const plan = this.getDailyPlan();
    plan.plan_water = Math.min(5, Math.round((data.current / data.target) * 5));
    this.setDailyPlan(plan);
    return data;
  },
  getActivities() {
    return Storage.get("activity", []);
  },
  addActivity(activity) {
    const list = this.getActivities();
    list.unshift(Object.assign({id: Utils.uid("act"), createdAt: Date.now()}, activity));
    Storage.set("activity", list);
    return list;
  },
  getJournalHistory() {
    return Storage.get("journal", []);
  },
  addJournalEntry(entry) {
    const list = this.getJournalHistory();
    list.unshift(Object.assign({id: Utils.uid("journal"), createdAt: Date.now()}, entry));
    Storage.set("journal", list);
    const plan = this.getDailyPlan();
    plan.plan_journal = 1;
    this.setDailyPlan(plan);
    return list;
  },
  deleteJournalEntry(id) {
    const list = this.getJournalHistory().filter(function(e) { return e.id !== id; });
    Storage.set("journal", list);
    return list;
  },
  getHealthCheckHistory() {
    return Storage.get("healthchecks", []);
  },
  addHealthCheckResult(result) {
    const list = this.getHealthCheckHistory();
    list.unshift(Object.assign({id: Utils.uid("check"), createdAt: Date.now()}, result));
    Storage.set("healthchecks", list);
    return list;
  },
  deleteHealthCheckResult(id) {
    const list = this.getHealthCheckHistory().filter(function(e) { return e.id !== id; });
    Storage.set("healthchecks", list);
    return list;
  },
  getFavoriteFacilities() {
    return Storage.get("favorites", []);
  },
  toggleFavoriteFacility(id) {
    let favs = this.getFavoriteFacilities();
    if (favs.includes(id)) {
      favs = favs.filter(function(f) { return f !== id; });
    } else {
      favs.push(id);
    }
    Storage.set("favorites", favs);
    return favs;
  },
  getSavedArticles() {
    return Storage.get("savedArticles", []);
  },
  toggleSavedArticle(id) {
    let saved = this.getSavedArticles();
    if (saved.includes(id)) {
      saved = saved.filter(function(s) { return s !== id; });
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
    return Storage.get("notifications", []);
  },
  markNotificationRead(id) {
    const list = this.getNotifications();
    const item = list.find(function(n) { return n.id === id; });
    if (item) item.unread = false;
    Storage.set("notifications", list);
    return list;
  },
  unreadNotifCount() {
    return this.getNotifications().filter(function(n) { return n.unread; }).length;
  },
  getScoreHistory() {
    return Storage.get("scoreHistory", []);
  },
  addScoreHistory(scoreObj) {
    const history = this.getScoreHistory();
    history.unshift(Object.assign({day: this.todayKey(), timestamp: Date.now()}, scoreObj));
    if (history.length > 30) history.pop();
    Storage.set("scoreHistory", history);
    return history;
  },
  getTrend() {
    return this.getScoreHistory().slice(0, 14).map(function(h) { return {day: h.day, score: h.score}; });
  },
  getScoreYesterday() {
    const history = this.getScoreHistory();
    if (history.length < 2) return null;
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var yKey = yesterday.getFullYear() + "-" + (yesterday.getMonth() + 1) + "-" + yesterday.getDate();
    var entry = history.find(function(h) { return h.day === yKey; });
    return entry ? entry.score : null;
  },
};

window.HealthState = HealthState;
