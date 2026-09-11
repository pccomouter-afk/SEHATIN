(function () {
  if (!Auth.guard()) return;
  Sidebar.init();
  NavbarTop.init('Fasilitas Kesehatan');
  ProfileDrawer.init();
  BottomNav.init();
  Router.init();

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

  function getDeviceLocation() {
    return new Promise(function(resolve, reject) {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
    });
  }

  async function loadFacilities() {
    let lat = -6.235;
    let lng = 106.805;
    const box = document.getElementById("facilities-list");
    const mapEl = document.getElementById("facility-map");
    if (box) box.innerHTML = '<div class="empty-state"><div class="skeleton" style="width:64px;height:64px;border-radius:50%;margin:0 auto var(--space-4);"></div><p class="text-small text-muted">Mencari fasilitas di sekitarmu...</p></div>';
    try {
      const pos = await getDeviceLocation();
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
      map.setView([lat, lng], 13);
    } catch(e) {
      Toast.error("Lokasi tidak dapat diakses. Silakan masukkan lokasi secara manual.");
    }
    await FacilitiesFeature.loadNearby(lat, lng);
    renderList();
  }

  async function searchByLocation(query) {
    const box = document.getElementById("facilities-list");
    box.innerHTML = '<div class="empty-state"><div class="skeleton" style="width:64px;height:64px;border-radius:50%;margin:0 auto var(--space-4);"></div><p class="text-small text-muted">Mencari...</p></div>';
    try {
      if (!query.trim()) {
        await loadFacilities();
        return;
      }
      const results = await FacilitiesFeature.searchLocation(query);
      if (results.length === 0) {
        box.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-map-marker-alt"></i></div><p>Lokasi tidak ditemukan. Coba gunakan alamat yang lebih spesifik.</p></div>';
        return;
      }
      const loc = results[0];
      map.setView([loc.lat, loc.lng], 13);
      await FacilitiesFeature.loadNearby(loc.lat, loc.lng);
      renderList();
    } catch(e) {
      box.innerHTML = '<div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-triangle-exclamation"></i></div><p>Gagal mencari lokasi.</p></div>';
    }
  }

  function renderMarkers(list) {
    markers.forEach(function(m) { map.removeLayer(m); });
    markers = [];
    list.forEach(function(f) {
      const marker = L.marker([f.lat, f.lng]).addTo(map).bindPopup("<strong>" + f.name + "</strong><br/>" + f.type);
      markers.push(marker);
    });
  }

  function renderList() {
    let list = FacilitiesFeature.getAll();
    if (activeType === "favorit") {
      const favs = HealthState.getFavoriteFacilities();
      list = list.filter(function(f) { return favs.includes(f.id); });
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
      .map(function(f) {
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

    Utils.qsa("[data-fav]", box).forEach(function(btn) {
      btn.addEventListener("click", function() {
        HealthState.toggleFavoriteFacility(this.getAttribute("data-fav"));
        Toast.success("Fasilitas berhasil disimpan.");
        renderList();
      });
    });
  }
  loadFacilities();

  Utils.qsa("[data-type]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      activeType = this.getAttribute("data-type");
      Utils.qsa("[data-type]").forEach(function(b) { b.classList.remove("is-selected"); });
      this.classList.add("is-selected");
      renderList();
    });
  });

  document.getElementById("facility-search-input").addEventListener(
    "input",
    Utils.debounce(function() {
      searchTerm = this.value.trim();
      renderList();
    }, 200)
  );

  var searchInput = document.getElementById("facility-search-input");
  searchInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && this.value.trim()) {
      searchByLocation(this.value.trim());
    }
  });

  var useLocationBtn = document.getElementById("facility-use-location-btn");
  if (useLocationBtn) {
    useLocationBtn.addEventListener("click", function() {
      loadFacilities();
    });
  }
})();
