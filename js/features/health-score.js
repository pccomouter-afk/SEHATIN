const HealthScoreFeature = {
  renderRing(svgEl, score) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const fill = svgEl.querySelector(".score-ring-fill");
    fill.style.strokeDasharray = circumference;
    fill.style.strokeDashoffset = circumference;
    requestAnimationFrame(() => {
      fill.style.strokeDashoffset = offset;
    });
  },
  buildBreakdownHtml(metrics) {
    const labels = { tidur: "Tidur", hidrasi: "Hidrasi", aktivitas: "Aktivitas", mood: "Mood", stress: "Stress", recovery: "Recovery" };
    return Object.keys(labels)
      .map((key) => {
        const val = metrics[key] || 0;
        return (
          '<div class="score-breakdown-row"><span>' +
          labels[key] +
          '</span><div class="flex items-center gap-2"><div class="metric-progress" style="width:90px;"><div class="metric-progress-fill" style="width:' +
          val +
          '%;"></div></div><strong>' +
          val +
          "</strong></div></div>"
        );
      })
      .join("");
  },
};

window.HealthScoreFeature = HealthScoreFeature;
