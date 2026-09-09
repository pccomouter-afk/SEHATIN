(function () {
  AppShell.init("facilities", "Detail Fasilitas");

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const facility = FacilitiesFeature.getById(id);
  const content = document.getElementById("fd-content");

  if (!facility) {
    content.innerHTML =
      '<div class="empty-state"><div class="empty-state-icon"><i class="fa-solid fa-triangle-exclamation"></i></div><p>Fasilitas tidak ditemukan.</p><a href="facilities.html" class="btn btn-secondary btn-sm">Kembali ke Fasilitas</a></div>';
    return;
  }

  const favs = HealthState.getFavoriteFacilities();
  const isFav = favs.includes(facility.id);

  content.innerHTML =
    '<div class="card fd-hero">' +
    '<div class="fd-hero-icon"><i class="fa-solid fa-hospital"></i></div>' +
    '<div style="flex:1;min-width:220px;">' +
    "<h1>" + facility.name + "</h1>" +
    '<div class="fd-hero-meta">' +
    '<span class="badge ' + (facility.status.indexOf("Buka") === 0 ? "badge-green" : "badge-navy") + '">' + facility.status + "</span>" +
    "<span>" + facility.type + "</span><span>&middot;</span>" +
    '<span><i class="fa-solid fa-star" style="color:var(--yellow);"></i> ' + facility.rating + "</span><span>&middot;</span>" +
    '<span><i class="fa-solid fa-location-dot"></i> ' + facility.distance + " km</span>" +
    "</div>" +
    '<p class="mt-2 text-small">' + facility.address + "</p>" +
    '<div class="fd-hero-actions">' +
    '<a class="btn btn-primary" href="https://www.openstreetmap.org/?mlat=' + facility.lat + "&mlon=" + facility.lng + '" target="_blank" rel="noopener"><i class="fa-solid fa-diamond-turn-right"></i> Petunjuk Arah</a>' +
    '<button class="btn btn-secondary" id="fd-save-btn"><i class="fa-solid fa-heart"></i> ' + (isFav ? "Tersimpan" : "Simpan") + "</button>" +
    '<a class="btn btn-secondary" href="tel:' + facility.phone + '"><i class="fa-solid fa-phone"></i> Hubungi</a>' +
    "</div></div></div>" +

    '<div class="grid grid-2 mt-6">' +
    '<div class="section-stack">' +
    '<div class="card"><h3>Tentang</h3><p class="mt-2">' + facility.about + "</p></div>" +
    '<div class="card"><h3>Layanan</h3><div class="fd-tag-list mt-4">' + facility.services.map((s) => '<span class="badge badge-blue">' + s + "</span>").join("") + "</div></div>" +
    '<div class="card"><h3>Fasilitas</h3><div class="fd-tag-list mt-4">' + facility.facilities.map((s) => '<span class="badge badge-green">' + s + "</span>").join("") + "</div></div>" +
    "</div>" +
    '<div class="section-stack">' +
    '<div class="card"><h3>Jam Operasional</h3><p class="mt-2">' + facility.hours + "</p></div>" +
    '<div class="card"><h3>Lokasi</h3><div class="fd-map mt-4" id="fd-map"></div></div>' +
    "</div>" +
    "</div>";

  document.getElementById("fd-save-btn").addEventListener("click", function () {
    HealthState.toggleFavoriteFacility(facility.id);
    const nowFav = HealthState.getFavoriteFacilities().includes(facility.id);
    this.innerHTML = '<i class="fa-solid fa-heart"></i> ' + (nowFav ? "Tersimpan" : "Simpan");
    Toast.success(nowFav ? "Fasilitas berhasil disimpan." : "Fasilitas dihapus dari favorit.");
  });

  const map = L.map("fd-map", { scrollWheelZoom: false }).setView([facility.lat, facility.lng], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap" }).addTo(map);
  L.marker([facility.lat, facility.lng]).addTo(map);
})();
