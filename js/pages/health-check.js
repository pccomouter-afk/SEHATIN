(function () {
  if (!Auth.guard()) return;
  Sidebar.init();
  NavbarTop.init('Pemeriksaan Kondisi');
  ProfileDrawer.init();
  BottomNav.init();
  Router.init();

  const questions = HealthCheckEngine.questions;
  let currentIndex = 0;
  let answers = {};

  function renderHistorySummary() {
    const history = HealthState.getHealthCheckHistory();
    const box = document.getElementById("hc-history-summary");
    if (history.length === 0) {
      box.innerHTML =
        '<div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-clock-rotate-left"></i></div><p>Belum ada hasil pemeriksaan sebelumnya.</p></div>';
      return;
    }
    box.innerHTML =
      "<h3>Riwayat Pemeriksaan</h3>" +
      history
        .slice(0, 4)
        .map(
          (h) =>
            '<div class="hc-history-item"><div><strong>' +
            Utils.formatDate(h.createdAt) +
            "</strong><div class=\"text-small text-muted mt-2\">Kondisi umum: " +
            h.kondisiUmum +
            " · Stres: " +
            h.stresStatus +
            '</div></div><button class="btn-icon" data-delete-history="' +
            h.id +
            '" aria-label="Hapus"><i class="fa-solid fa-trash"></i></button></div>'
        )
        .join("");
    Utils.qsa("[data-delete-history]", box).forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-delete-history");
        Modal.confirm({
          title: "Hapus riwayat ini?",
          message: "Riwayat pemeriksaan yang dihapus tidak dapat dikembalikan.",
          icon: "fa-trash",
          confirmText: "Ya, Hapus",
          onConfirm: () => {
            HealthState.deleteHealthCheckResult(id);
            renderHistorySummary();
            Toast.success("Riwayat pemeriksaan berhasil dihapus.");
          },
        });
      });
    });
  }
  renderHistorySummary();

  function showSection(id) {
    ["hc-intro", "hc-question", "hc-result"].forEach((s) => {
      document.getElementById(s).style.display = s === id ? "" : "none";
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.getElementById("hc-start-btn").addEventListener("click", function () {
    currentIndex = 0;
    answers = {};
    showSection("hc-question");
    renderQuestion();
  });

  function renderQuestion() {
    const q = questions[currentIndex];
    document.getElementById("hc-progress-text").textContent = "Pertanyaan " + (currentIndex + 1) + " dari " + questions.length;
    document.getElementById("hc-domain-text").textContent = q.domain;
    document.getElementById("hc-progress-fill").style.width = ((currentIndex + 1) / questions.length) * 100 + "%";
    document.getElementById("hc-question-text").textContent = q.text;
    document.getElementById("hc-validation-error").style.display = "none";

    const selected = answers[q.id];
    document.getElementById("hc-options").innerHTML = q.options
      .map((opt) => {
        const isSelected = q.type === "multi" ? Array.isArray(selected) && selected.includes(opt) : selected === opt;
        return (
          '<button type="button" class="select-card' +
          (isSelected ? " is-selected" : "") +
          '" data-option="' +
          Utils.escapeHtml(opt) +
          '" style="margin-bottom:10px;width:100%;"><span class="select-card-check"><i class="fa-solid fa-check"></i></span><span>' +
          opt +
          "</span></button>"
        );
      })
      .join("");

    Utils.qsa("[data-option]").forEach((btn) => {
      btn.addEventListener("click", function () {
        const opt = this.getAttribute("data-option");
        if (q.type === "multi") {
          let arr = Array.isArray(answers[q.id]) ? answers[q.id].slice() : [];
          if (opt === "Tidak ada keluhan") {
            arr = arr.includes(opt) ? [] : [opt];
          } else {
            arr = arr.filter((o) => o !== "Tidak ada keluhan");
            if (arr.includes(opt)) arr = arr.filter((o) => o !== opt);
            else arr.push(opt);
          }
          answers[q.id] = arr;
        } else {
          answers[q.id] = opt;
        }
        renderQuestion();
      });
    });

    document.getElementById("hc-prev-btn").style.visibility = currentIndex === 0 ? "hidden" : "visible";
    document.getElementById("hc-next-btn").textContent = currentIndex === questions.length - 1 ? "Lihat Hasil" : "Selanjutnya";
  }

  document.getElementById("hc-prev-btn").addEventListener("click", function () {
    if (currentIndex === 0) return;
    currentIndex -= 1;
    renderQuestion();
  });

  document.getElementById("hc-next-btn").addEventListener("click", function () {
    const q = questions[currentIndex];
    if (!HealthCheckEngine.isAnswered(q, answers)) {
      document.getElementById("hc-validation-error").style.display = "flex";
      return;
    }
    if (currentIndex < questions.length - 1) {
      currentIndex += 1;
      renderQuestion();
    } else {
      finishAssessment();
    }
  });

  function finishAssessment() {
    const result = HealthCheckEngine.computeResult(answers);
    HealthState.addHealthCheckResult(result);
    document.getElementById("res-kondisi").textContent = result.kondisiUmum;
    document.getElementById("res-tidur").textContent = result.tidurStatus;
    document.getElementById("res-aktivitas").textContent = result.aktivitasStatus;
    document.getElementById("res-stres").textContent = result.stresStatus;
    document.getElementById("res-attention").innerHTML = result.attentionPoints
      .map((p) => '<div class="hc-list-item"><i class="fa-solid fa-circle-exclamation" style="color:var(--warning);margin-top:4px;"></i><span>' + p + "</span></div>")
      .join("");
    document.getElementById("res-recommendations").innerHTML = result.recommendations
      .map((p) => '<div class="hc-list-item"><i class="fa-solid fa-circle-check" style="color:var(--primary);margin-top:4px;"></i><span>' + p + "</span></div>")
      .join("");
    document.getElementById("res-serious-note").style.display = result.seriousFlags ? "block" : "none";
    showSection("hc-result");
  }
})();
