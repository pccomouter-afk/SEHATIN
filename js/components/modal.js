const Modal = {
  root: null,
  ensureRoot() {
    if (this.root) return this.root;
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML =
      '<div class="modal-box" role="dialog" aria-modal="true">' +
      '<div class="modal-header"><button class="btn-icon modal-close" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button></div>' +
      '<div class="modal-body">' +
      '<div class="modal-icon" data-role="icon"><i class="fa-solid fa-triangle-exclamation"></i></div>' +
      '<h3 data-role="title">Konfirmasi</h3>' +
      '<p data-role="message" class="mt-2"></p>' +
      "</div>" +
      '<div class="modal-footer">' +
      '<button class="btn btn-secondary" data-role="cancel">Batal</button>' +
      '<button class="btn btn-danger" data-role="confirm">Ya, Lanjutkan</button>' +
      "</div>" +
      "</div>";
    document.body.appendChild(overlay);
    this.root = overlay;
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.close();
    });
    overlay.querySelector(".modal-close").addEventListener("click", () => this.close());
    overlay.querySelector('[data-role="cancel"]').addEventListener("click", () => this.close());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) this.close();
    });
    return overlay;
  },
  confirm(options) {
    const overlay = this.ensureRoot();
    overlay.querySelector('[data-role="title"]').textContent = options.title || "Konfirmasi";
    overlay.querySelector('[data-role="message"]').textContent = options.message || "";
    const iconWrap = overlay.querySelector('[data-role="icon"]');
    iconWrap.className = "modal-icon" + (options.neutral ? " is-neutral" : "");
    iconWrap.innerHTML = '<i class="fa-solid ' + (options.icon || "fa-triangle-exclamation") + '"></i>';
    const confirmBtn = overlay.querySelector('[data-role="confirm"]');
    confirmBtn.textContent = options.confirmText || "Ya, Lanjutkan";
    confirmBtn.className = "btn " + (options.neutral ? "btn-primary" : "btn-danger");
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    newConfirmBtn.addEventListener("click", () => {
      this.close();
      if (typeof options.onConfirm === "function") options.onConfirm();
    });
    overlay.classList.add("is-open");
    document.body.classList.add("no-scroll");
  },
  close() {
    if (!this.root) return;
    this.root.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
  },
};

window.Modal = Modal;
