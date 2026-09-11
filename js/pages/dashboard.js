(function () {
  AppShell.init("dashboard", "Dashboard");

  const user = Auth.currentUser() || { name: "Pengguna" };
  document.getElementById("greeting-text").textContent = Utils.greetingByHour() + ", " + user.name.split(" ")[0] + ".";

  const metrics = HealthState.getMetrics();
  const scoreObj = HealthState.getHealthScore();
  const yesterday = HealthState.getScoreYesterday();

  if (scoreObj) {
    HealthState.addScoreHistory({score: scoreObj.score, status: scoreObj.status});
  }

  const scoreEl = document.getElementById("score-value");
  const statusEl = document.getElementById("score-status");
  const changeEl = document.getElementById("score-change");

  if (!scoreObj) {
    scoreEl.textContent = "-";
    statusEl.textContent = "Belum tersedia";
    changeEl.textContent = "";
    changeEl.className = "badge dash-score-change";
    document.getElementById("score-card").querySelector("svg").innerHTML = "";
    document.getElementById("score-breakdown").innerHTML = '<div class="empty-state"><p>Isi data kesehatanmu untuk melihat skor.</p></div>';
  } else {
    scoreEl.textContent = scoreObj.score;
    statusEl.textContent = scoreObj.status;
    if (yesterday !== null) {
      const diff = scoreObj.score - yesterday;
      changeEl.textContent = (diff >= 0 ? "+" : "") + diff + " dari kemarin";
      changeEl.className = "badge dash-score-change " + (diff >= 0 ? "badge-green" : "badge-red");
    } else {
      changeEl.textContent = "Belum ada data kemarin";
      changeEl.className = "badge dash-score-change";
    }
    HealthScoreFeature.renderRing(document.getElementById("score-card").querySelector("svg"), scoreObj.score);

    if (metrics) {
      const breakdown = document.getElementById("score-breakdown");
      breakdown.innerHTML = HealthScoreFeature.buildBreakdownHtml(metrics);
    } else {
      document.getElementById("score-breakdown").innerHTML = "";
    }
  }

  document.getElementById("score-card").addEventListener("click", function (e) {
    if (e.target.closest(".score-breakdown-popover")) return;
    const wrap = document.querySelector(".score-ring-wrap");
    const rect = wrap.getBoundingClientRect();
    const cardRect = document.getElementById("score-card").getBoundingClientRect();
    const breakdown = document.getElementById("score-breakdown");
    breakdown.style.top = rect.bottom - cardRect.top + 12 + "px";
    breakdown.style.left = Math.max(0, rect.left - cardRect.left - 50) + "px";
    breakdown.classList.toggle("is-visible");
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest("#score-card")) {
      const breakdown = document.getElementById("score-breakdown");
      breakdown.classList.remove("is-visible");
    }
  });

  const metricDefs = [
    { key: "tidur", label: "Tidur", icon: "fa-moon" },
    { key: "hidrasi", label: "Hidrasi", icon: "fa-droplet" },
    { key: "aktivitas", label: "Aktivitas", icon: "fa-person-walking" },
    { key: "mood", label: "Mood", icon: "fa-face-smile" },
    { key: "stress", label: "Stres", icon: "fa-brain" },
    { key: "recovery", label: "Recovery", icon: "fa-battery-three-quarters" },
  ];
  document.getElementById("metrics-grid").innerHTML = metricDefs
    .map(
      (m) => {
        const val = metrics ? metrics[m.key] : 0;
        return (
          '<div class="metric-card"><div class="metric-card-top"><span class="metric-label">' +
          m.label +
          '</span><i class="fa-solid ' +
          m.icon +
          '" style="color:var(--primary-dark);"></i></div><span class="metric-value">' +
          (val > 0 ? val : "Belum tersedia") +
          '</span><div class="metric-progress"><div class="metric-progress-fill" style="width:' +
          (val > 0 ? val : 0) +
          '%;"></div></div></div>'
        );
      }
    )
    .join("");

  document.getElementById("quick-add-water").addEventListener("click", function () {
    HealthState.addHydration(250);
    Toast.success("Berhasil menambah 250 ml air minum.");
    renderDailyPlan();
  });

  const trend = HealthState.getTrend();
  const trendContainer = document.getElementById("trend-chart-container");
  if (trend.length < 2) {
    trendContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-chart-line"></i></div><p>Data tren skor masih sedikit. Terus catat kesehatanmu!</p></div>';
  } else {
    const svg = document.getElementById("trend-chart");
    const width = 320;
    const height = 160;
    const padding = 20;
    const maxScore = 100;
    const points = trend.map(function(t, i) {
      const x = padding + (i * (width - padding * 2)) / (trend.length - 1);
      const y = height - padding - (t.score / maxScore) * (height - padding * 2);
      return { x: x, y: y, label: t.day, score: t.score };
    });
    const linePath = points.map(function(p, i) { return (i === 0 ? "M" : "L") + p.x + "," + p.y; }).join(" ");
    const areaPath = linePath + " L" + points[points.length - 1].x + "," + (height - padding) + " L" + points[0].x + "," + (height - padding) + " Z";
    svg.innerHTML =
      '<defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#41ca4e" stop-opacity="0.35"/><stop offset="100%" stop-color="#41ca4e" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' + areaPath + '" fill="url(#areaGrad)" stroke="none"></path>' +
      '<path class="trend-chart-line" d="' + linePath + '"></path>' +
      points.map(function(p) { return '<circle class="trend-chart-dot" cx="' + p.x + '" cy="' + p.y + '" r="4"></circle>'; }).join("") +
      points.map(function(p) { return '<text class="trend-chart-axis" x="' + p.x + '" y="' + (height - 2) + '" text-anchor="middle">' + p.label + "</text>"; }).join("");
  }

  const plan = HealthState.getDailyPlan();
  const planDefs = [
    { id: "plan_water", label: "Minum air", target: 5, unit: "gelas" },
    { id: "plan_steps", label: "Berjalan", target: 6000, unit: "langkah" },
    { id: "plan_rest", label: "Istirahat", target: 3, unit: "jeda" },
    { id: "plan_journal", label: "Jurnal", target: 1, unit: "catatan" },
  ];

  function renderDailyPlan() {
    document.getElementById("daily-plan-list").innerHTML = planDefs
      .map(
        (p) => {
          const current = plan[p.id] || 0;
          const done = current >= p.target;
          return (
            '<div class="dash-plan-item' +
            (done ? " is-done" : "") +
            '" data-plan="' +
            p.id +
            '"><button class="dash-plan-check" data-plan-toggle="' +
            p.id +
            '"><i class="fa-solid fa-check"></i></button><div class="dash-plan-text"><strong>' +
            p.label +
            "</strong><span class=\"text-small text-muted\">" +
            current +
            " dari " +
            p.target +
            " " +
            p.unit +
            "</span></div></div>"
          );
        }
      )
      .join("");
    Utils.qsa("[data-plan-toggle]").forEach(function(btn) {
      btn.addEventListener("click", function() {
        const id = this.getAttribute("data-plan-toggle");
        const def = planDefs.find(function(p) { return p.id === id; });
        const prog = HealthState.getDailyPlan();
        prog[id] = prog[id] >= def.target ? 0 : def.target;
        HealthState.setDailyPlan(prog);
        renderDailyPlan();
      });
    });
  }
  renderDailyPlan();

  const activities = HealthState.getActivities();
  const activityCard = document.getElementById("recent-activity-card");
  if (activities.length === 0) {
    activityCard.innerHTML =
      '<div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-person-walking"></i></div><p>Belum ada aktivitas tercatat.</p><a href="health.html" class="btn btn-secondary btn-sm">Catat Aktivitas</a></div>';
  } else {
    activityCard.innerHTML = activities
      .slice(0, 3)
      .map(
        (a) =>
          '<div class="dash-plan-item"><div class="icon-chip"><i class="fa-solid fa-person-running"></i></div><div class="dash-plan-text"><strong>' +
          Utils.escapeHtml(a.type) +
          "</strong><span class=\"text-small text-muted\">" +
          a.duration +
          " menit · " +
          a.intensity +
          " · " +
          Utils.timeAgo(a.createdAt) +
          "</span></div></div>"
      )
      .join("");
  }

  const recommendations = [
    { icon: "fa-moon", title: "Perbaiki Rutinitas Tidur", desc: "Coba tidur di jam yang sama setiap malam.", href: "library.html" },
    { icon: "fa-droplet", title: "Cukupi Kebutuhan Air", desc: "Target hidrasimu masih perlu dipenuhi.", href: "health.html" },
    { icon: "fa-wind", title: "Coba Ruang Tenang", desc: "Latihan pernapasan 5 menit untuk meredakan stres.", href: "health.html?tab=wellness" },
  ];
  document.getElementById("recommendation-grid").innerHTML = recommendations
    .map(
      (r) =>
        '<a class="card recommend-card" href="' +
        r.href +
        '"><div class="icon-chip"><i class="fa-solid ' +
        r.icon +
        '"></i></div><div><strong>' +
        r.title +
        '</strong><p class="text-small mt-2">' +
        r.desc +
        "</p></div></a>"
    )
    .join("");
})();
