const FacilitiesFeature = {
  getAll() {
    return MockData.facilities;
  },
  getById(id) {
    return MockData.facilities.find((f) => f.id === id);
  },
  filterByType(list, type) {
    if (!type || type === "Semua") return list;
    return list.filter((f) => f.type === type);
  },
  search(list, term) {
    if (!term) return list;
    const t = term.toLowerCase();
    return list.filter((f) => f.name.toLowerCase().includes(t) || f.type.toLowerCase().includes(t) || f.address.toLowerCase().includes(t));
  },
};

window.FacilitiesFeature = FacilitiesFeature;
