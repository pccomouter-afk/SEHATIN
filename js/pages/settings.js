(function () {
  AppShell.init("settings", "Pengaturan");

  const user = Auth.currentUser() || {};
  document.getElementById("settings-avatar").textContent = Utils.initials(user.name);
  document.getElementById("settings-name-preview").textContent = user.name || "";
  document.getElementById("settings-email-preview").textContent = user.email || "";
  document.getElementById("settings-name").value = user.name || "";
  document.getElementById("settings-email").value = user.email || "";
  document.getElementById("settings-phone").value = user.phone || "";

  document.getElementById("profile-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("settings-name").value.trim();
    const email = document.getElementById("settings-email").value.trim();
    const phone = document.getElementById("settings-phone").value.trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Toast.error("Pastikan nama dan email terisi dengan benar.");
      return;
    }
    Auth.updateProfile({ name, email, phone });
    document.getElementById("settings-avatar").textContent = Utils.initials(name);
    document.getElementById("settings-name-preview").textContent = name;
    document.getElementById("settings-email-preview").textContent = email;
    Toast.success("Pengaturan berhasil diperbarui.");
  });

  const settings = HealthState.getSettings();
  document.getElementById("pref-water").value = settings.targetWater;
  document.getElementById("pref-sleep").value = settings.targetSleep;
  document.getElementById("pref-activity").value = settings.targetActivity;
  document.getElementById("pref-reminder").value = settings.reminderTime;

  document.getElementById("preference-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const current = HealthState.getSettings();
    current.targetWater = parseFloat(document.getElementById("pref-water").value) || current.targetWater;
    current.targetSleep = parseInt(document.getElementById("pref-sleep").value, 10) || current.targetSleep;
    current.targetActivity = parseInt(document.getElementById("pref-activity").value, 10) || current.targetActivity;
    current.reminderTime = document.getElementById("pref-reminder").value || current.reminderTime;
    HealthState.setSettings(current);
    Toast.success("Pengaturan berhasil diperbarui.");
  });

  Utils.qsa("[data-notif]").forEach((input) => {
    const key = input.getAttribute("data-notif");
    input.checked = !!settings[key];
    input.addEventListener("change", function () {
      const current = HealthState.getSettings();
      current[key] = this.checked;
      HealthState.setSettings(current);
      Toast.success("Pengaturan berhasil diperbarui.");
    });
  });

  Utils.qsa("[data-appearance]").forEach((btn) => {
    if (btn.getAttribute("data-appearance") === settings.appearance) btn.classList.add("is-selected");
    btn.addEventListener("click", function () {
      Utils.qsa("[data-appearance]").forEach((b) => b.classList.remove("is-selected"));
      this.classList.add("is-selected");
      const current = HealthState.getSettings();
      current.appearance = this.getAttribute("data-appearance");
      HealthState.setSettings(current);
      Toast.success("Pengaturan berhasil diperbarui.");
    });
  });

  document.getElementById("privasi-check-count").textContent = HealthState.getHealthCheckHistory().length + " hasil tersimpan";
  document.getElementById("privasi-journal-count").textContent = HealthState.getJournalHistory().length + " catatan tersimpan";

  document.getElementById("delete-all-data-btn").addEventListener("click", function () {
    Modal.confirm({
      title: "Hapus semua data lokal?",
      message: "Seluruh riwayat pemeriksaan, jurnal, dan preferensi akan dihapus secara permanen dari perangkat ini.",
      icon: "fa-trash",
      confirmText: "Ya, Hapus Semua",
      onConfirm: () => {
        Storage.clear(true);
        Toast.success("Data berhasil dihapus.");
        setTimeout(() => window.location.reload(), 600);
      },
    });
  });

  const faqBox = document.getElementById("faq-list");
  faqBox.innerHTML = MockData.faq
    .map(
      (f, i) =>
        '<div class="faq-item" data-faq="' +
        i +
        '"><div class="faq-question">' +
        f.q +
        '<i class="fa-solid fa-chevron-down"></i></div><p class="faq-answer">' +
        f.a +
        "</p></div>"
    )
    .join("");
  Utils.qsa("[data-faq]", faqBox).forEach((item) => {
    item.querySelector(".faq-question").addEventListener("click", function () {
      item.classList.toggle("is-open");
    });
  });

  document.getElementById("settings-logout-btn").addEventListener("click", function () {
    AppShell.confirmLogout();
  });
})();
