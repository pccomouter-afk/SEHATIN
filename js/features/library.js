const LibraryFeature = {
  getAll() {
    return MockData.articles;
  },
  getById(id) {
    return MockData.articles.find((a) => a.id === id);
  },
  filterByCategory(list, category) {
    if (!category || category === "Semua") return list;
    return list.filter((a) => a.category === category);
  },
  search(list, term) {
    if (!term) return list;
    const t = term.toLowerCase();
    return list.filter((a) => a.title.toLowerCase().includes(t) || a.summary.toLowerCase().includes(t));
  },
  related(article) {
    return MockData.articles.filter((a) => a.category === article.category && a.id !== article.id).slice(0, 3);
  },
};

window.LibraryFeature = LibraryFeature;
