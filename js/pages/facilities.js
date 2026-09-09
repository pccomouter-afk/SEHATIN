(function () {
  AppShell.init("facilities", "Fasilitas Kesehatan");

  let activeType = "Semua";
  let searchTerm = "";
  let map = null;
  let markers = [];

  function initMap() {
    map = L.map("facility-map", { scrollWheelZoom: false }).setView([-6.235, 106.805], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
  }
  initMap();

  function renderMarkers(list) {
    markers.forEach((m) => map.removeLayer(m));
    markers = [];
    list.forEach((f) => {
      const marker = L.marker([f.lat, f.lng]).addTo(map).bindPopup("<strong>" + f.name + "</strong><br/>" + f.type);
      markers.push(marker);
    });
  }

  function renderList() {
    let list = FacilitiesFeature.getAll();
    if (activeType === "favorit") {
      const favs = HealthState.getFavoriteFacilities();
      list = list.filter((f) => favs.includes(f.id));
    } else {
      list = FacilitiesFeature.filterByType(list, activeType);
    }
    list = FacilitiesFeature.search(list, searchTerm);
    renderMarkers(list);

    const box = document.getElementById("facilities-list");
    if (list.length === 0) {
      box.innerHTML =
        '<div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-hospital"></i></div><p>' +
        (activeType === "favorit" ? "Belum ada fasilitas tersimpan." : "Fasilitas tidak ditemukan.") +
        "</p></div>";
      return;
    }
    const favs = HealthState.getFavoriteFacilities();
    box.innerHTML = list
      .map((f) => {
        const isFav = favs.includes(f.id);
        return (
          '<div class="facility-card"><div class="facility-card-thumb"><i class="fa-solid fa-hospital"></i></div><div class="facility-card-body">' +
          '<div class="flex items-center justify-between gap-2"><strong>' +
          f.name +
          '</strong><span class="badge ' +
          (f.status.indexOf("Buka") === 0 || f.status === "Buka 24 Jam" ? "badge-green" : "badge-navy") +
          '">' +
          f.status +
          "</span></div>" +
          '<div class="facility-card-meta"><span>' +
          f.type +
          '</span><span>&middot;</span><span><i class="fa-solid fa-location-dot"></i> ' +
          f.distance +
          ' km</span><span>&middot;</span><span><i class="fa-solid fa-star" style="color:var(--yellow);"></i> ' +
          f.rating +
          "</span></div>" +
          '<div class="facility-card-actions">' +
          '<a class="btn btn-primary btn-sm" href="facility-detail.html?id=' +
          f.id +
          '">Lihat Detail</a>' +
          '<a class="btn btn-secondary btn-sm" href="https://www.openstreetmap.org/?mlat=' +
          f.lat +
          "&mlon=" +
          f.lng +
          '" target="_blank" rel="noopener">Petunjuk Arah</a>' +
          '<button class="btn-icon' +
          (isFav ? " is-active" : "") +
          '" data-fav="' +
          f.id +
          '" aria-label="Favorit"><i class="fa-solid fa-heart"></i></button>' +
          "</div></div></div>"
        );
      })
      .join("");

    Utils.qsa("[data-fav]", box).forEach((btn) => {
      btn.addEventListener("click", function () {
        HealthState.toggleFavoriteFacility(this.getAttribute("data-fav"));
        Toast.success("Fasilitas berhasil disimpan.");
        renderList();
      });
    });
  }
  renderList();

  Utils.qsa("[data-type]").forEach((btn) => {
    btn.addEventListener("click", function () {
      activeType = this.getAttribute("data-type");
      Utils.qsa("[data-type]").forEach((b) => b.classList.remove("is-selected"));
      this.classList.add("is-selected");
      renderList();
    });
  });

  document.getElementById("facility-search-input").addEventListener(
    "input",
    Utils.debounce(function () {
      searchTerm = this.value.trim();
      renderList();
    }, 200)
  );
})();
