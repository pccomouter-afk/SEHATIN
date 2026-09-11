(function () {
  if (!Auth.guard()) return;
  Sidebar.init();
  NavbarTop.init('Jurnal Kesehatan');
  ProfileDrawer.init();
  BottomNav.init();
  Router.init();

  ["mood", "energi", "tidur", "hidrasi"].forEach(function(id) {
    const input = document.getElementById(id);
    const label = document.getElementById(id + "-val");
    input.addEventListener("input", function() {
      label.textContent = this.value;
    });
  });

  document.getElementById("journal-insight-text").textContent = JournalFeature.buildInsight();

  function renderHistory() {
    const list = HealthState.getJournalHistory();
    const box = document.getElementById("journal-history-list");
    if (list.length === 0) {
      box.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-book-medical"></i></div><p>Belum ada catatan hari ini.</p></div>';
      return;
    }
    box.innerHTML = list
      .map(
        (e) =>
          '<div class="journal-entry-item"><div class="icon-chip"><i class="fa-solid fa-book-medical"></i></div><div style="flex:1;"><div class="flex items-center justify-between"><strong>' +
          Utils.formatDate(e.createdAt) +
          '</strong><button class="btn-icon" data-delete-journal="' +
          e.id +
          '" aria-label="Hapus"><i class="fa-solid fa-trash"></i></button></div><div class="text-small text-muted mt-2">Mood ' +
          e.mood +
          "/5 · Energi " +
          e.energi +
          "/5 · Tidur " +
          e.tidur +
          " jam</div>" +
          (e.keluhan ? '<div class="text-small mt-2">Keluhan: ' + Utils.escapeHtml(e.keluhan) + "</div>" : "") +
          (e.catatan ? '<p class="text-small mt-2">' + Utils.escapeHtml(e.catatan) + "</p>" : "") +
          "</div></div>"
      )
      .join("");
    Utils.qsa("[data-delete-journal]", box).forEach(function(btn) {
      btn.addEventListener("click", function() {
        const id = this.getAttribute("data-delete-journal");
        Modal.confirm({
          title: "Hapus catatan jurnal?",
          message: "Catatan ini tidak dapat dikembalikan setelah dihapus.",
          icon: "fa-trash",
          confirmText: "Ya, Hapus",
          onConfirm: function() {
            HealthState.deleteJournalEntry(id);
            renderHistory();
            document.getElementById("journal-insight-text").textContent = JournalFeature.buildInsight();
            Toast.success("Catatan jurnal berhasil dihapus.");
          },
        });
      });
    });
  }
  renderHistory();

  document.getElementById("journal-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const entry = {
      mood: document.getElementById("mood").value,
      energi: document.getElementById("energi").value,
      tidur: document.getElementById("tidur").value,
      hidrasi: document.getElementById("hidrasi").value,
      keluhan: document.getElementById("keluhan").value.trim(),
      catatan: document.getElementById("catatan").value.trim(),
    };
    HealthState.addJournalEntry(entry);
    renderHistory();
    document.getElementById("journal-insight-text").textContent = JournalFeature.buildInsight();
    this.reset();
    ["mood", "energi", "hidrasi"].forEach(function(id) { document.getElementById(id + "-val").textContent = "3"; });
    document.getElementById("tidur-val").textContent = "7";
    Toast.success("Jurnal berhasil disimpan.");
  });
})();
