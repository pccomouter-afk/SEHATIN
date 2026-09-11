const FacilitiesFeature = {
  _data: [],
  _loaded: false,

  getAll() {
    return this._data;
  },

  getById(id) {
    return this._data.find(function(f) { return f.id === id; });
  },

  filterByType(list, type) {
    if (!type || type === "Semua") return list;
    return list.filter(function(f) { return f.type === type; });
  },

  search(list, term) {
    if (!term) return list;
    const t = term.toLowerCase();
    return list.filter(function(f) {
      return (f.name || "").toLowerCase().includes(t) || (f.type || "").toLowerCase().includes(t) || (f.displayName || "").toLowerCase().includes(t);
    });
  },

  async loadNearby(lat, lng) {
    const overpassUrl = "https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=hospital](around:5000," + lat + "," + lng + ");out;";
    try {
      const resp = await fetch(overpassUrl);
      const data = await resp.json();
      this._data = (data.elements || []).map(function(el, i) {
        return {
          id: "fac_" + el.osm_id + "_" + i,
          name: el.tags && el.tags.name ? el.tags.name : "Fasilitas Tidak Dikenal",
          type: "Rumah Sakit",
          lat: el.lat,
          lng: el.lon,
          status: "Buka 24 Jam",
          rating: "4.0",
          distance: "0.5",
          address: el.tags && el.tags["addr:street"] ? el.tags["addr:street"] + (el.tags["addr:housenumber"] ? " " + el.tags["addr:housenumber"] : "") : "Informasi alamat tidak tersedia",
          phone: el.tags && el.tags.phone ? el.tags.phone : "Informasi tidak tersedia",
          services: el.tags && el.tags["amenity"] ? [el.tags["amenity"]] : ["Informasi tidak tersedia"],
        };
      });
      this._loaded = true;
    } catch(e) {
      this._data = [];
      this._loaded = false;
    }
    return this._data;
  },

  async searchLocation(query) {
    const url = "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(query) + "&format=json&limit=5";
    try {
      const resp = await fetch(url, { headers: { "Accept-Language": "id" } });
      const data = await resp.json();
      return data.map(function(r) {
        return {
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
          displayName: r.display_name,
        };
      });
    } catch(e) {
      return [];
    }
  },
};

window.FacilitiesFeature = FacilitiesFeature;
