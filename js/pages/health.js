(function () {
  AppShell.init("health", "Kesehatan Saya");

  function switchTab(tab) {
    Utils.qsa(".health-tab-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-tab") === tab);
    });
    ["tidur", "hidrasi", "aktivitas", "wellness"].forEach((t) => {
      document.getElementById("tab-" + t).style.display = t === tab ? "" : "none";
    });
  }

  Utils.qsa(".health-tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      switchTab(this.getAttribute("data-tab"));
    });
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get("tab")) switchTab(params.get("tab"));

  function renderHydration() {
    const data = HealthState.getHydration();
    const pct = HydrationFeature.percentage(data);
    document.getElementById("hydration-fill").style.height = pct + "%";
    document.getElementById("hydration-progress-fill").style.width = pct + "%";
    document.getElementById("hydration-text").textContent = (data.current / 1000).toFixed(1) + " / " + (data.target / 1000).toFixed(1) + " L";
  }
  renderHydration();
  document.getElementById("add-250").addEventListener("click", function () {
    HealthState.addHydration(250);
    renderHydration();
    Toast.success("Berhasil menambah 250 ml air minum.");
  });
  document.getElementById("add-500").addEventListener("click", function () {
    HealthState.addHydration(500);
    renderHydration();
    Toast.success("Berhasil menambah 500 ml air minum.");
  });

  function renderActivityLog() {
    const list = HealthState.getActivities();
    const box = document.getElementById("activity-log");
    if (list.length === 0) {
      box.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-person-walking"></i></div><p>Belum ada aktivitas tercatat hari ini.</p></div>';
      return;
    }
    box.innerHTML = list
      .map(
        (a) =>
          '<div class="activity-log-item"><div class="flex items-center gap-3"><div class="icon-chip"><i class="fa-solid fa-person-running"></i></div><div><strong>' +
          Utils.escapeHtml(a.type) +
          '</strong><div class="text-small text-muted">' +
          a.duration +
          " menit · " +
          a.intensity +
          "</div></div></div><span class=\"text-xsmall text-muted\">" +
          Utils.timeAgo(a.createdAt) +
          "</span></div>"
      )
      .join("");
  }
  renderActivityLog();

  document.getElementById("add-activity-btn").addEventListener("click", function () {
    const card = document.getElementById("activity-form-card");
    card.style.display = card.style.display === "none" ? "block" : "none";
  });

  let selectedIntensity = "Ringan";
  Utils.qsa("[data-intensity]").forEach((btn) => {
    btn.addEventListener("click", function () {
      selectedIntensity = this.getAttribute("data-intensity");
      Utils.qsa("[data-intensity]").forEach((b) => b.classList.remove("is-selected"));
      this.classList.add("is-selected");
    });
  });

  document.getElementById("activity-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const type = document.getElementById("activity-type").value;
    const duration = parseInt(document.getElementById("activity-duration").value, 10);
    const errorEl = document.querySelector('[data-error-for="activity-duration"]');
    if (!duration || duration <= 0) {
      errorEl.classList.add("is-visible");
      return;
    }
    errorEl.classList.remove("is-visible");
    HealthState.addActivity({ type, duration, intensity: selectedIntensity });
    renderActivityLog();
    document.getElementById("activity-form").reset();
    document.getElementById("activity-form-card").style.display = "none";
    Toast.success("Aktivitas berhasil dicatat.");
  });

  let breathTimer = null;
  function startBreathing(minutes) {
    document.getElementById("wellness-intro").style.display = "none";
    document.getElementById("breathing-view").style.display = "block";
    let remaining = minutes * 60;
    const circle = document.getElementById("breathing-circle");
    const timerEl = document.getElementById("breathing-timer");
    let phase = 0;
    const phases = ["Tarik Napas", "Tahan", "Buang Napas"];
    function updatePhase() {
      circle.textContent = phases[phase % 3];
      circle.className = "breathing-circle" + (phase % 3 === 0 ? " is-inhale" : phase % 3 === 2 ? " is-exhale" : "");
      phase += 1;
    }
    updatePhase();
    const phaseInterval = setInterval(updatePhase, 4000);
    breathTimer = setInterval(function () {
      remaining -= 1;
      const m = String(Math.floor(remaining / 60)).padStart(2, "0");
      const s = String(remaining % 60).padStart(2, "0");
      timerEl.textContent = m + ":" + s;
      if (remaining <= 0) {
        clearInterval(breathTimer);
        clearInterval(phaseInterval);
        stopBreathing();
        Toast.success("Latihan pernapasan selesai.");
      }
    }, 1000);
    document.getElementById("stop-breathing").onclick = function () {
      clearInterval(breathTimer);
      clearInterval(phaseInterval);
      stopBreathing();
    };
  }
  function stopBreathing() {
    document.getElementById("breathing-view").style.display = "none";
    document.getElementById("wellness-intro").style.display = "block";
  }
  Utils.qsa("[data-breathe-min]").forEach((btn) => {
    btn.addEventListener("click", function () {
      startBreathing(parseInt(this.getAttribute("data-breathe-min"), 10));
    });
  });
  document.getElementById("start-mindfulness").addEventListener("click", function () {
    startBreathing(5);
  });

  const wQuestions = WellnessEngine.questions;
  let wIndex = 0;
  let wAnswers = {};

  document.getElementById("start-wellness-btn").addEventListener("click", function () {
    wIndex = 0;
    wAnswers = {};
    document.getElementById("wellness-intro").style.display = "none";
    document.getElementById("wellness-question-view").style.display = "block";
    renderWQuestion();
  });

  function renderWQuestion() {
    const q = wQuestions[wIndex];
    document.getElementById("w-progress-text").textContent = "Pertanyaan " + (wIndex + 1) + " dari " + wQuestions.length;
    document.getElementById("w-progress-fill").style.width = ((wIndex + 1) / wQuestions.length) * 100 + "%";
    document.getElementById("w-question-text").textContent = q.text;
    document.getElementById("w-options").innerHTML = q.options
      .map(
        (opt) =>
          '<button type="button" class="select-card' +
          (wAnswers[q.id] === opt ? " is-selected" : "") +
          '" data-w-option="' +
          Utils.escapeHtml(opt) +
          '" style="margin-bottom:10px;width:100%;"><span class="select-card-check"><i class="fa-solid fa-check"></i></span><span>' +
          opt +
          "</span></button>"
      )
      .join("");
    Utils.qsa("[data-w-option]").forEach((btn) => {
      btn.addEventListener("click", function () {
        wAnswers[q.id] = this.getAttribute("data-w-option");
        renderWQuestion();
      });
    });
    document.getElementById("w-prev-btn").style.visibility = wIndex === 0 ? "hidden" : "visible";
    document.getElementById("w-next-btn").textContent = wIndex === wQuestions.length - 1 ? "Lihat Hasil" : "Selanjutnya";
  }

  document.getElementById("w-prev-btn").addEventListener("click", function () {
    if (wIndex === 0) return;
    wIndex -= 1;
    renderWQuestion();
  });

  document.getElementById("w-next-btn").addEventListener("click", function () {
    const q = wQuestions[wIndex];
    if (!wAnswers[q.id]) {
      Toast.error("Pilih salah satu jawaban terlebih dahulu.");
      return;
    }
    if (wIndex < wQuestions.length - 1) {
      wIndex += 1;
      renderWQuestion();
    } else {
      const guidance = WellnessEngine.computeGuidance(wAnswers);
      document.getElementById("w-result-title").textContent = guidance.title;
      document.getElementById("w-result-points").innerHTML = guidance.points
        .map((p) => '<div class="hc-list-item mt-2"><i class="fa-solid fa-circle-check" style="color:var(--primary);"></i><span>' + p + "</span></div>")
        .join("");
      document.getElementById("wellness-question-view").style.display = "none";
      document.getElementById("wellness-result-view").style.display = "block";
    }
  });

  document.getElementById("wellness-back-btn").addEventListener("click", function () {
    document.getElementById("wellness-result-view").style.display = "none";
    document.getElementById("wellness-intro").style.display = "block";
  });
})();
